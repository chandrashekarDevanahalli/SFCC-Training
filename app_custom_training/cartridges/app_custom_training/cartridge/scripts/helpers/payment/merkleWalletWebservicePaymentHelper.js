'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

function good() {
    return 'good'
}

function merkleWalletValidateCustomDetails(paymentInstrument) {
    try {
        var merkleWalletFirstName = paymentInstrument.custom.merkleWalletFirstName;
        var merkleWalletLastName = paymentInstrument.custom.merkleWalletLastName;
        var merkleWalletPhoneNumber = paymentInstrument.custom.merkleWalletPhoneNumber;
        var merkleWalletTotalAmount = paymentInstrument.paymentTransaction.getAmount().getValue();
        var merklWalletRecord = CustomObjectMgr.getCustomObject('MerkleWallet', merkleWalletPhoneNumber);
        if (merklWalletRecord) {
            Transaction.wrap(function () {
                var customObjectMerklWalletPhoneNumber = merklWalletRecord.custom.merkleWalletPhoneNumber;
                var customObjectMerklWalletRecordFullName = merklWalletRecord.custom.merkleWalletFullName;
                var customObjectmerklWalletRecordBalance = merklWalletRecord.custom.merkleWalletBalance;
                var fullName = merkleWalletFirstName + ' ' + merkleWalletLastName
                if (fullName.toLowerCase() != customObjectMerklWalletRecordFullName.toLowerCase()) {
                    return 'error.invalid.first.last.name'
                }

                if (customObjectmerklWalletRecordBalance < merkleWalletTotalAmount) {
                    return 'error.insufficient.balance'
                }
                var remainingBalance = customObjectmerklWalletRecordBalance - merkleWalletTotalAmount;
                Transaction.wrap(function () {
                    merklWalletRecord.custom.merkleWalletBalance = remainingBalance;
                });
            })
        } else {
            return 'error.invalid.card.number';
            Logger.error('Record is not available for the credit card number' + ccNumber);
        }
    } catch (error) {
        Logger.error('Failed to read the credit card details from custom object because of' + error.message);
        var err = error.message
        res.json({
            error: err
        });
    }

}

module.exports.merkleWalletValidateCustomDetails = merkleWalletValidateCustomDetails;