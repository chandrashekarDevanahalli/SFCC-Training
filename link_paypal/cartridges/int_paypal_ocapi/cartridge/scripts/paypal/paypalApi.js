'use strict';

const Resource = require('dw/web/Resource');

const paypalRestService = require('*/cartridge/scripts/service/paypalRestService');
const {
    createErrorLog,
    createErrorMsg
} = require('*/cartridge/scripts/paypal/paypalUtils');
const {
    createBillingAddressFromOrder
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');
const {
    isCapture,
    partnerAttributionId
} = require('*/cartridge/config/paypalPreferences');

const payPalConstants = require('*/cartridge/scripts/util/paypalConstants');
const PATH_CHECKOUT_ORDERS = payPalConstants.PATH_CHECKOUT_ORDERS;
const internalServiceErrorMessage = Resource.msg('paypal.ocapi.error.internal_service_error', 'locale', null);

/**
 * Deprecated method, must to be modify.
 * Function to get BA details
 * If BA exists it is used as payment source in body
 *
 * @param {Object} paymentInstrument - paymentInstrument
 * @returns {Object} Call handling result
 */
function getBADetails(paymentInstrument) {
    try {
        if (!paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
            createErrorLog(Resource.msg('paypal.ocapi.error.noactive.billingAgreement.wasfound', 'locale', null));

            throw internalServiceErrorMessage;
        }
        var baID;
        try {
            baID = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement).baID;
        } catch (error) {
            createErrorLog(error);
            return new Error(error);
        }

        var resp = paypalRestService.call({
            path: '/v1/billing-agreements/agreements/' + baID,
            method: 'GET'
        });
        if (resp.state !== 'ACTIVE') {
            return { active: false };
        }
        return {
            id: resp.id,
            billing_info: resp.payer.payer_info,
            shipping_address: resp.shipping_address,
            active: true
        };
    } catch (err) {
        throw err;
    }
}

/**
 * Deprecated method, must to be modify.
 * Create a billing agreement token
 * Pass the agreement details including the description, payer, and billing plan in the JSON request body.
 *
 * @param {Object} restRequestData data
 * @returns {Object} Call returns the HTTP 201 Created status code and a JSON response that includes an approval URL:
 */
function getBillingAgreementToken(restRequestData) {
    try {
        var resp = paypalRestService.call(restRequestData);

        return { billingAgreementToken: resp.token_id };
    } catch (err) {
        throw err;
    }
}

/**
 * Deprecated method, must to be modify.
 * Makes post call using facilitator Access Token and transfers billingToken
 *  save's billingAgreementID & billingAgreementPayerEmail to input field
 *  and triggers checkout place order stage
 *
 * @param {string} billingToken - billing agreement token
 * @returns {Object} JSON response that includes the billing agreement ID and information about the payer
 */
function createBillingAgreement(billingToken) {
    try {
        if (!billingToken) {
            createErrorLog(Resource.msg('paypal.ocapi.error.nobillingToken.provided', 'locale', null));

            throw internalServiceErrorMessage;
        }
        var reqObj = {
            path: 'v1/billing-agreements/agreements',
            method: 'POST',
            body: {
                token_id: billingToken
            }
        };
        var resp = paypalRestService.call(reqObj);

        if (resp) {
            return resp;
        }

        createErrorLog(Resource.msg('paypal.ocapi.error.nobillingAgreementId.wasfound', 'locale', null));
        throw new Error();
    } catch (err) {
        throw err;
    }
}

/**
 * Deprecated method, must to be modify.
 * Function to cancel BA
 * If BA exists it is used as payment source in body
 *
 * @param {Object} baID - billing agreement ID to cancel
 * @returns {Object} Call handling result
 */
function cancelBillingAgreement(baID) {
    try {
        if (!baID) {
            createErrorLog(Resource.msg('paypal.ocapi.error.nobillingAgreementId.provided', 'locale', null));
            throw new Error();
        }
        return paypalRestService.call({
            path: '/v1/billing-agreements/agreements/' + baID + '/cancel',
            method: 'POST'
        });
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

/**
 * Deprecated method, must to be modify.
 * Function to get information about an order
 *
 * @param {Object} paymentInstrument - paypalPaymentInstrument
 * @returns {Object} Call handling result
 */
function getOrderDetails(paymentInstrument) {
    try {
        var resp = paypalRestService.call({
            path: PATH_CHECKOUT_ORDERS + paymentInstrument.custom.paypalOrderID,
            method: 'GET',
            body: {}
        });
        var payerObject = resp.payer;

        if (resp) {
            return {
                orderId: resp.id,
                billing_info: createBillingAddressFromOrder(payerObject),
                payer: payerObject,
                purchase_units: resp.purchase_units
            };
        }

        createErrorLog(
            Resource.msgf('paypal.ocapi.error.nopayerInfo.wasfound', 'locale', null, paymentInstrument.custom.paypalOrderID)
        );
        throw new Error();
    } catch (err) {
        throw err;
    }
}

/**
 * Function to update information about an order
 *
 * @param {Object} paymentInstrument - paypalPaymentInstrument
 * @param {Object} purchaseUnit - purchase unit
 * @returns {Object} Call handling result
 */
function updateOrderDetails(paymentInstrument, purchaseUnit) {
    const Money = require('dw/value/Money');

    try {
        paypalRestService.call({
            path: PATH_CHECKOUT_ORDERS + paymentInstrument.custom.paypalOrderID,
            method: 'PATCH',
            body: [
                {
                    op: 'replace',
                    path: "/purchase_units/@reference_id=='default'",
                    value: purchaseUnit
                }
            ]
        });

        if (paymentInstrument.paymentTransaction.amount.value !== purchaseUnit.amount.value) {
            paymentInstrument.paymentTransaction.setAmount(new Money(purchaseUnit.amount.value, purchaseUnit.amount.currency_code));
        }

        return { isOkUpdate: true };
    } catch (err) {
        throw err.message;
    }
}

/**
 * Deprecated method, must to be modify.
 * Function to create order if BA exists
 * If BA exists it is used as payment source in body
 *
 * @param {Object} purchaseUnit - purchaseUnit
 * @returns {Object} Call handling result
 */
function createOrder(purchaseUnit) {
    try {
        if (!purchaseUnit) {
            createErrorLog(Resource.msg('paypal.ocapi.error.purchaseUnit.notfound', 'locale', null));

            throw internalServiceErrorMessage;
        }

        var resp = paypalRestService.call({
            path: 'v2/checkout/orders',
            body: {
                intent: isCapture ? payPalConstants.INTENT_TYPE_CAPTURE : payPalConstants.INTENT_TYPE_AUTHORIZE,
                purchase_units: [purchaseUnit]
            },
            partnerAttributionId: partnerAttributionId
        });

        return {
            resp: resp
        };
    } catch (err) {
        throw err;
    }
}

/**
 * Deprecated method, must to be modify.
 * Function to create transaction
 * If BA exists it is used as payment source in body
 *
 * @param {Object} paymentInstrument - paypalPaymentInstrument
 * @param {Object} bodyObj - payment source with BA id if BA exists
 * @returns {Object} Call handling result
 */
function createTransaction(paymentInstrument, bodyObj) {
    try {
        if (!paymentInstrument.custom.paypalOrderID) {
            createErrorLog(
                Resource.msg('paypal.ocapi.error.paymentinstrument.order_id.notfound', 'locale', null)
            );

            throw internalServiceErrorMessage;
        }

        var actionType = isCapture ?
            payPalConstants.INTENT_TYPE_CAPTURE.toLowerCase() :
            payPalConstants.INTENT_TYPE_AUTHORIZE.toLowerCase();
        var response = paypalRestService.call({
            path: PATH_CHECKOUT_ORDERS + paymentInstrument.custom.paypalOrderID + '/' + actionType,
            body: bodyObj || {}
        });
        return {
            response: response
        };
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getBADetails: getBADetails,
    getBillingAgreementToken: getBillingAgreementToken,
    createBillingAgreement: createBillingAgreement,
    cancelBillingAgreement: cancelBillingAgreement,
    getOrderDetails: getOrderDetails,
    createTransaction: createTransaction,
    createOrder: createOrder,
    updateOrderDetails: updateOrderDetails
};
