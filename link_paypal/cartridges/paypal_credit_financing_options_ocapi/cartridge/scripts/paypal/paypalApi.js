'use strict';

const Resource = require('dw/web/Resource');

const paypalRestService = require('*/cartridge/scripts/service/paypalRestService');
const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
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
const PATH_CHECKOUT_ORDERS = 'v2/checkout/orders/';
const messageOrderIdNotFound = Resource.msg('paypal.ocapi.error.api_order_id_notfound', 'paypalerrors', null);

/**
 * Function to get BA details
 * If BA exists it is used as payment source in body
 *
 * @param {Object} paymentInstrument - paymentInstrument
 * @returns {Object} Call handling result
 */
function getBADetails(paymentInstrument) {
    try {
        if (!paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
            const messageBANotFound = Resource.msg('paypal.no.billing.agreement.error', 'paypalerrors', null);
            createErrorLog(messageBANotFound);
            throw new Error(messageBANotFound);
        }
        let baID;
        try {
            baID = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement).baID;
        } catch (error) {
            createErrorLog(error);
            return new Error(error);
        }

        const resp = paypalRestService.call({
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
        return { err: createErrorMsg(err.message) };
    }
}

/**
 * Create a billing agreement token
 * Pass the agreement details including the description, payer, and billing plan in the JSON request body.
 *
 * @param {Object} restRequestData data
 * @returns {Object} Call returns the HTTP 201 Created status code and a JSON response that includes an approval URL:
 */
function getBillingAgreementToken(restRequestData) {
    try {
        const resp = paypalRestService.call(restRequestData);
        
        if (resp) {
            return { billingAgreementToken: resp.token_id };
        }

        const messageBATokenNotFound = Resource.msg('paypal.no.billing.agreement.token.error', 'paypalerrors', null);
        createErrorLog(messageBATokenNotFound);
        throw new Error(messageBATokenNotFound);
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

/**
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
            const messageNoBillingToken = Resource.msg('paypal.no.billing.token.error', 'paypalerrors', null);
            createErrorLog(messageNoBillingToken);
            throw new Error(messageNoBillingToken);
        }
        const reqObj = {
            path: 'v1/billing-agreements/agreements',
            method: 'POST',
            body: {
                token_id: billingToken
            }
        };
        const resp = paypalRestService.call(reqObj);
        if (resp) {
            return resp;
        }

        const messageBAIdNotFound = Resource.msg('paypal.no.billing.agreement.id.error', 'paypalerrors', null);
        createErrorLog(messageBAIdNotFound);
        throw new Error(messageBAIdNotFound);
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

/**
 * Function to cancel BA
 * If BA exists it is used as payment source in body
 *
 * @param {Object} baID - billing agreement ID to cancel
 * @returns {Object} Call handling result
 */
function cancelBillingAgreement(baID) {
    try {
        if (!baID) {
            const messageBAIdNotProvided = Resource.msg('paypal.no.billing.agreement.id.provided.error', 'paypalerrors', null);
            createErrorLog(messageBAIdNotProvided);
            throw new Error(messageBAIdNotProvided);
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
 * Function to get information about an order
 *
 * @param {Object} paymentInstrument - paypalPaymentInstrument
 * @returns {Object} Call handling result
 */
function getOrderDetails(paymentInstrument) {
    try {
        const resp = paypalRestService.call({
            path: PATH_CHECKOUT_ORDERS + paymentInstrument.custom.paypalOrderID,
            method: 'GET',
            body: {}
        });
        const payerObject = resp.payer;

        if (resp) {
            return {
                orderId: resp.id,
                billing_info: createBillingAddressFromOrder(payerObject),
                payer: payerObject,
                purchase_units: resp.purchase_units
            };
        }

        createErrorLog(Resource.msgf('paypal.no.payer.info.found.error', 'paypalerrors', null, paymentInstrument.custom.paypalOrderID));
        throw new Error(Resource.msgf('paypal.no.payer.info.found.error', 'paypalerrors', null, paymentInstrument.custom.paypalOrderID));
    } catch (err) {
        return { err: createErrorMsg(err.message) };
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
        if (!paymentInstrument.custom.paypalOrderID) {
            createErrorLog(messageOrderIdNotFound);
            throw new Error(messageOrderIdNotFound);
        }
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
        return { err: createErrorMsg(err.message) };
    }
}

/**
 * Function to create order if BA exists
 * If BA exists it is used as payment source in body
 *
 * @param {Object} purchaseUnit - purchaseUnit
 * @returns {Object} Call handling result
 */
function createOrder(purchaseUnit) {
    try {
        if (!purchaseUnit) {
            createErrorLog(Resource.msg('paypal.no.purchase.unit.error', 'paypalerrors', null));
            throw new Error(Resource.msg('paypal.no.purchase.unit.error', 'paypalerrors', null));
        }
        const resp = paypalRestService.call({
            path: 'v2/checkout/orders',
            body: {
                intent: isCapture ? paypalConstants.INTENT_CAPTURE : paypalConstants.INTENT_AUTHORIZE,
                purchase_units: [purchaseUnit]
            },
            partnerAttributionId: partnerAttributionId
        });
        return {
            resp: resp
        };
    } catch (err) {
        return { err: createErrorMsg(err.message) };
    }
}

/**
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
            createErrorLog(messageOrderIdNotFound);
            throw new Error(messageOrderIdNotFound);
        }

        const actionType = isCapture ? paypalConstants.ACTION_TYPE_CAPTURE : paypalConstants.ACTION_TYPE_AUTHORIZE;
        const response = paypalRestService.call({
            path: PATH_CHECKOUT_ORDERS + paymentInstrument.custom.paypalOrderID + '/' + actionType,
            body: bodyObj || {}
        });
        return {
            response: response
        };
    } catch (err) {
        return { err: createErrorMsg(err.message) };
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
