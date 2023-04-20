'use strict';

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
    var array = require('*/cartridge/scripts/util/array');

    var viewData = viewFormData;


    viewData.paymentMethod = {
        value: paymentForm.paymentMethod.value,
        htmlName: paymentForm.paymentMethod.value
    };
    viewData.paymentInformation = {
        firstName: {
            value: paymentForm.merkleWalletFields.firstName.value,
            htmlName: paymentForm.merkleWalletFields.firstName.htmlName
        },
        lastName: {
            value: paymentForm.merkleWalletFields.lastName.value,
            htmlName: paymentForm.merkleWalletFields.lastName.htmlName
        },
        phoneNumber: {
            value: paymentForm.merkleWalletFields.phone.value,
            htmlName: paymentForm.merkleWalletFields.phone.htmlName
        }
    };

    return {
        error: false,
        viewData: viewData
    };
}

/**
 * Save the credit card information to login account if save card option is selected
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
function savePaymentInformation(req, basket, billingData) {
    var CustomerMgr = require('dw/customer/CustomerMgr');

    if (!billingData.storedPaymentUUID &&
        req.currentCustomer.raw.authenticated &&
        req.currentCustomer.raw.registered &&
        billingData.saveCard &&
        (billingData.paymentMethod.value === 'CREDIT_CARD')
    ) {
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );

        var saveCardResult = COHelpers.savePaymentInstrumentToWallet(
            billingData,
            basket,
            customer
        );

    }
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;