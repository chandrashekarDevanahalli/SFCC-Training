'use strict';

/**
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 *
 */

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');

function merkleCreditValidate(paymentInstrument) {
    try {
        var ccNumber = paymentInstrument.getCreditCardNumberLastDigits();
        var ccName = paymentInstrument.getCreditCardHolder();
        var expMonth = paymentInstrument.getCreditCardExpirationMonth();
        var expYear = paymentInstrument.getCreditCardExpirationYear();
        var TotalAmount = paymentInstrument.paymentTransaction.getAmount().getValue();
        var merkleCreditRecord = CustomObjectMgr.getCustomObject('Bank', ccNumber);
        if (merkleCreditRecord) {
            var customObjectCardNumber = merkleCreditRecord.custom.ccNumber;
            var customObjectCardName = merkleCreditRecord.custom.ccName;
            var customObjectCardExpMonth = merkleCreditRecord.custom.ccExpiryMonth;
            var customObjectCardExpYear = merkleCreditRecord.custom.ccExpiryYear;
            var customObjectCardBalance = merkleCreditRecord.custom.ccBalance;
            if (ccName.toLowerCase() != customObjectCardName.toLowerCase()) {
                return 'error.invalid.card.name';
            }
            if (customObjectCardExpMonth != expMonth || customObjectCardExpYear != expYear) {
                return 'error.invalid.card.expiry.date';
            }
            if (customObjectCardBalance < TotalAmount) {
                return 'error.insufficient.balance'
            }
            var remainingBalance = customObjectCardBalance - TotalAmount;
            Transaction.wrap(function () {
                merkleCreditRecord.custom.ccBalance = remainingBalance;
            });
        } else {
            return 'error.invalid.card.number';
            Logger.error('Record is not available for the credit card number' + ccNumber);
        }
    } catch (error) {
        Logger.error('Failed to read the credit card details from custom object because of' + error.message);
    }

};

module.exports = {
    merkleCreditValidate: merkleCreditValidate
};