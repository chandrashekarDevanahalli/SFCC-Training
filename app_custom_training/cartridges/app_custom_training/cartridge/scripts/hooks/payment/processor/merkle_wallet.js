'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');


function Handle(basket, paymentInformation, paymentMethodID, req) {
    var currentBasket = basket;
    var merkleWalletErrors = {}
    var serverErrors = [];
    var firstName = paymentInformation.firstName.value;
    var lastName = paymentInformation.lastName.value;
    var phoneNumber = paymentInformation.phoneNumber.value;


    //validate payment instrument
    Transaction.wrap(function () {

        var paymentInstruments = currentBasket.getPaymentInstruments();

        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        var paymentInstrument = currentBasket.createPaymentInstrument(
            paymentMethodID, currentBasket.totalGrossPrice
        );

        paymentInstrument.custom.merkleWalletFirstName = firstName;
        paymentInstrument.custom.merkleWalletLastName = lastName;
        paymentInstrument.custom.merkleWalletPhoneNumber = phoneNumber;
        Logger.info('merkle_Wallet payment instrument created')

    });
    return {
        serverErrors: serverErrors,
        error: false
    };
}

/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Result = require('dw/svc/Result');

function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;
    var merkleWalletForm = session.forms.billing.merkleWalletFields;

    //This line commented for assigment 40 (webservices) its for assignment 27

    var merkleWalletValidate = require('*/cartridge/scripts/helpers/payment/paymentCustomHelpers')
    var merkleWallet = merkleWalletValidate.merkleWalletValidateCustomDetails(paymentInstrument)
    if (merkleWallet) {
        throw new Error(merkleWallet);
    }
    try {
        //     var svc = LocalServiceRegistry.createService('app_custom_training.http.paymentvalidate.get', {
        //         createRequest: function (svc, params) {
        //             svc = svc.setRequestMethod('GET');
        //             var url = svc.getURL();
        //             url += '?id=' + params.orderNumber;
        //             svc = svc.setURL(url);
        //             return "";
        //         },
        //         parseResponse: function (svc, responseObject) {
        //             return responseObject;
        //         }
        //     });
        //     var order = orderNumber;
        //     var result = svc.call({
        //         orderNumber: order
        //     });
        //     if (result.getStatus() === Result.OK) {
        //         var resultObj = JSON.parse(result.object.text)
        //         return resultObj;
        //     } else {
        //         return result.getUnavailableReason();
        //     }

        var firstName = merkleWalletForm.firstName.value;
        var lastName = merkleWalletForm.lastName.value;
        var phoneNumber = merkleWalletForm.phone.value


        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
            paymentInstrument.paymentTransaction.custom.merkleWalletFirstName = firstName
            paymentInstrument.paymentTransaction.custom.merkleWalletLastName = lastName
            paymentInstrument.paymentTransaction.custom.merkleWalletPhoneNumber = phoneNumber
        });
    } catch (e) {
        var msg = e;
        Logger.error(e);
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return {
        fieldErrors: fieldErrors,
        serverErrors: serverErrors,
        error: error
    };
}

exports.Handle = Handle;
exports.Authorize = Authorize;