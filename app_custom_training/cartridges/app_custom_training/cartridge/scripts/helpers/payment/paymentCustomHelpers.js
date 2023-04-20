'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

function merkleWalletValidateCustomDetails(paymentInstrument) {
    try {
        var merkleWalletFirstName = paymentInstrument.custom.merkleWalletFirstName;
        var merkleWalletLastName = paymentInstrument.custom.merkleWalletLastName;
        var merkleWalletPhoneNumber = paymentInstrument.custom.merkleWalletPhoneNumber;
        var merkleWalletTotalAmount = paymentInstrument.paymentTransaction.amount.value;
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
            });
        } else {
            return 'error.invalid.phone.number';
            Logger.error('Record is not available for number' + merkleWalletPhoneNumber);
        }
    } catch (error) {
        Logger.error('Failed to read the custom object because of' + error.message);
    }

}

module.exports = {
    merkleWalletValidateCustomDetails: merkleWalletValidateCustomDetails
};