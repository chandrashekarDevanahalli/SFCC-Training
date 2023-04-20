'use strict';

const Resource = require('dw/web/Resource');

const paypalPreferences = require('*/cartridge/config/paypalPreferences');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const payPalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
const validationHelper = require('*/cartridge/scripts/paypal/helpers/validationHelper');
const billingAgreementHelper = require('*/cartridge/scripts/paypal/helpers/billingAgreementHelper');

const billingAgreementEnabled = paypalPreferences.billingAgreementEnabled;

// Hook dw.ocapi.shop.basket.payment_instrument.afterPOST functionality

/**
* Sets all customs attributes to payment instrument related to billing agreement flow
* @param {dw.order.Basket} basket Current basket
* @param {dw.order.PaymentInstrument} paymentInstrument Current payment instrument of basket
 */
function billingAgreementFlow(basket, paymentInstrument) {
    if (!paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
        const billingAgreementResponse = paypalApi.createBillingAgreement(paymentInstrument.custom.paypalToken);
        const payerEmail = billingAgreementResponse.payer.payer_info.email;

        paymentInstrument.custom.currentPaypalEmail = payerEmail;
        paymentInstrument.custom.PP_API_ActiveBillingAgreement = JSON.stringify({
            baID: billingAgreementResponse.id,
            email: payerEmail
        });
        billingAgreementHelper.createCustomerPaymentInstrument(basket, paymentInstrument);
        paymentInstrument.custom.paypalToken = null;
    }
}

/**
 * Deprecated method, must to be modify.
 * Sets all customs attributes to payment instrument related to orderId flow
 * @param {dw.order.PaymentInstrument} paymentInstrument Current payment instrument of basket
 */
function orderIdFlow(paymentInstrument) {
    const orderDetailsObject = paypalApi.getOrderDetails(paymentInstrument);

    paymentInstrument.custom.currentPaypalEmail = orderDetailsObject.payer.email_address;
}

/**
 * Returns a current Paypal basket payment instrument
 * @param {dw.order.Basket} basket The current basket
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request.
 * @returns {dw.order.PaymentInstrument} The current basket payment instrument
 */
function getCurrentBasketPI(basket, paymentInstrument) {
    return basket.paymentInstruments.toArray().find(function (basketPaymentInstrument) {
        return basketPaymentInstrument.custom.paypalToken === paymentInstrument.c_paypalToken ||
              basketPaymentInstrument.custom.paypalOrderID === paymentInstrument.c_paypalOrderID;
    });
}

/**
 * The function is called after payment instrument adding to a basket
 * Handles a PayPal payment instrument
 * @param {dw.order.Basket} basket The current basket
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function afterPOST(basket, paymentInstrument) {
    try {
        // We expect all neccessary data for LPM is provided in request body
        if (!payPalHelper.isLpmUsed(paymentInstrument.c_paymentId)) {
            const currentBasketPI = getCurrentBasketPI(basket, paymentInstrument);

            if (billingAgreementEnabled) {
            // Flow with enabled billing agreement
                billingAgreementFlow(basket, currentBasketPI);
            } else {
                // Flow with disabled billing agreement
                orderIdFlow(currentBasketPI);
            }
        }
    } catch (err) {
        return hooksHelper.createErrorStatus(err);
    }
}

// Hook dw.ocapi.shop.basket.payment_instrument.beforePOST functionality

/**
 * Returns whether a saved payPal billing agreement flow used
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request
 * @returns {boolean} True/false
 */
function isSavedBaFlow(paymentInstrument) {
    return billingAgreementEnabled && paymentInstrument.c_PP_API_ActiveBillingAgreement &&
        (!paymentInstrument.c_paypalToken && !paymentInstrument.c_paypalOrderID);
}

/**
 * Validates a request with new PayPal billing token or OrderId
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request
 */
function newPayPalRequestValidator(paymentInstrument) {
    // Validates a PayPal billing agreement token
    if (billingAgreementEnabled && !validationHelper.validateRequestStringValue(paymentInstrument.c_paypalToken)) {
        throw Resource.msg('paypal.ocapi.error.paymentinstrument.paypal_token.notfound', 'locale', null);
    }

    // Validates a PayPal order Id
    if (!billingAgreementEnabled && !validationHelper.validateRequestStringValue(paymentInstrument.c_paypalOrderID)) {
        throw Resource.msg('paypal.ocapi.error.paymentinstrument.order_id.notfound', 'locale', null);
    }

    // In case of LPM, validates a currentPaypalEmail custom value of payment instrument
    // that we expect in the request body
    if (payPalHelper.isLpmUsed(paymentInstrument.c_paymentId) && !validationHelper.validateRequestStringValue(!paymentInstrument.c_currentPaypalEmail)) {
        throw Resource.msg('paypal.ocapi.error.paymentinstrument.currentPaypalEmail.notfound', 'locale', null);
    }
}

/**
 * Validates a request with saved PayPal billing agreement
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request
 */
function savedPayPalRequestValidator(paymentInstrument) {
    const activeBa = paymentInstrument.c_PP_API_ActiveBillingAgreement;

    if (validationHelper.validateRequestStringValue(activeBa)) {
        try {
            const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
            const billingAgreementInstance = new BillingAgreementModel();
            const parsedActiveBa = JSON.parse(activeBa);
            const email = parsedActiveBa.email;
            const baId = parsedActiveBa.baID;

            // Validates an active billing agreement's values (id and email)
            if (!validationHelper.validateRequestStringValue(baId)) {
                throw Resource.msg('paypal.ocapi.error.paymentinstrument.pp_api_activeBillingAgreement.notfound', 'locale', null);
            } else if (!validationHelper.validateRequestStringValue(email)) {
                throw Resource.msg('paypal.ocapi.error.paymentinstrument.ba.email.notfound', 'locale', null);
            }

            const billingAgreement = billingAgreementInstance.getBillingAgreementByEmail(email);

            if (!billingAgreement) {
                throw Resource.msgf('paypal.ocapi.error.ba.notfound', 'locale', null, baId);
            }
        } catch (error) {
            throw new Error (error);
        }
    } else {
        throw Resource.msg('paypal.ocapi.error.paymentinstrument.pp_api_activeBillingAgreement.notfound', 'locale', null);
    }
}

/**
 * The function is called before payment instrument adding to a basket to validate request body values
 * @param {dw.order.Basket} _basket The current basket
 * @param {BasketPaymentInstrumentRequest} paymentInstrument Document representing a basket payment instrument request
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePOST(_basket, paymentInstrument) {
    try {
        if (paymentInstrument.amount === null || paymentInstrument.amount.get() === 0) {
            throw Resource.msg('paypal.ocapi.error.paymentinstrument.amount', 'locale', null);
        }

        // Validates a paymentId custom value of payment instrument
        // Use in both saved as well as new PayPal account flow
        if (!validationHelper.validatePaymentIdFromRequest(paymentInstrument.c_paymentId)) {
            throw Resource.msg('paypal.ocapi.error.paymentinstrument.paymentId.invalid', 'locale', null);
        }

        if (isSavedBaFlow(paymentInstrument)) {
            savedPayPalRequestValidator(paymentInstrument);
        } else {
            newPayPalRequestValidator(paymentInstrument);
        }
    } catch (err) {
        return hooksHelper.createErrorStatus(err);
    }
}

exports.afterPOST = afterPOST;
exports.beforePOST = beforePOST;
