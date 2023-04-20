'use strict';

const Resource = require('dw/web/Resource');

// Helpers and tools
const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');

// Hook dw.ocapi.shop.basket.afterPOST functionality

/**
 * Sets a default site shipping method to the default basket shipment
 * @param {dw.order.Basket} basket The current basket
 */
function setDefaultShippingMethod(basket) {
    const ShippingMgr = require('dw/order/ShippingMgr');

    basket.shipments[0].setShippingMethod(ShippingMgr.getDefaultShippingMethod());
}

/**
 * The function is called after the basket was created.
 * Used in the follwing resource: /baskets
 * @param {dw.order.Basket} basket The current basket
 */
function afterPOST(basket) {
    setDefaultShippingMethod(basket);
}

// Hook dw.ocapi.shop.basket.modifyGETResponse functionality

/**
 * Sets the billing agreement token value into the basketResponse document
 * @param {dw.order.Basket} basket The current basket
 * @param {basketResponse} basketResponse Document representing a basket.
 * @param {string} isBillingPage True/false
 */
function billingAgreementFlow(basket, basketResponse, isBillingPage) {
    const billingAgreementTokenObject = paypalApi.getBillingAgreementToken(
        paypalHelper.getBARestData(isBillingPage, basket)
    );

    basketResponse.c_billingAgreementToken = billingAgreementTokenObject.billingAgreementToken;
}

/**
 * Returns a payment instrument with active billing agreement
 * @param {dw.order.Basket} basket The current basket
 * @returns {dw.order.PaymentInstrument} The basket payment instrument
 */
function getPiWithActiveBillingAgreement(basket) {
    if (empty(basket.paymentInstruments)) {
        return null;
    }

    return basket.paymentInstruments.toArray().find(function (paymentInstrument) {
        return paymentInstrument.custom.PP_API_ActiveBillingAgreement !== null;
    });
}

/**
 * Returns a payment instrument with orderId value in custom
 * @param {dw.order.Basket} basket The current basket
 * @returns {dw.order.PaymentInstrument} The basket payment instrument
 */
function getPiWithOrderId(basket) {
    if (empty(basket.paymentInstruments)) {
        return null;
    }

    return basket.paymentInstruments.toArray().find(function (paymentInstrument) {
        return paymentInstrument.custom.paypalOrderID !== null;
    });
}

/**
 * The function modify get response by adding custom attributes
 * Used in the follwing resource: /baskets
 * @param {dw.order.Basket} basket The current basket
 * @param {basketResponse} basketResponse Document representing a basket.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function modifyGETResponse(basket, basketResponse) {
    const buttonConfigsHelper = require('*/cartridge/scripts/paypal/helpers/buttonConfigsHelper');
    const paypalPreferences = require('*/cartridge/config/paypalPreferences');
    const createObjectFromQueryString = hooksHelper.createObjectFromQueryString;

    try {
        const pageId = createObjectFromQueryString(request.httpQueryString).pageId;
        const isBillingPage = pageId === paypalConstants.PAGE_FLOW_BILLING;
        const piWithActiveBillingAgreement = getPiWithActiveBillingAgreement(basket);
        const piWithOrderId = getPiWithOrderId(basket);

        // Sets a PayPal button configs for current page
        if (paypalHelper.isPayPalBtnEnabledOnCurrentPage(pageId)) {
            basketResponse.c_paypalButtonConfigs = buttonConfigsHelper.getPayPalButtonConfigsForCurrentPage(basket, pageId);
        }

        // Returns whether a billing agreement or order deatails
        // in case if the basket contains payment instrument
        if (piWithActiveBillingAgreement || piWithOrderId) {
            if (piWithActiveBillingAgreement) {
                basketResponse.c_billingAgreementDetails = paypalApi.getBADetails(piWithActiveBillingAgreement);
            } else {
                basketResponse.c_orderDetails = paypalApi.getOrderDetails(piWithOrderId);
            }
        // Basket does not contain a payment instrument flow
        } else if (paypalPreferences.billingAgreementEnabled) {
            // Billing agreement enabled flow
            billingAgreementFlow(basket, basketResponse, isBillingPage);
        } else {
            // Billing agreement disabled flow
            basketResponse.c_purchaseUnit = paypalHelper.getPurchaseUnit(basket, isBillingPage);
        }
    } catch (err) {
        return hooksHelper.createErrorStatus(err);
    }
}

// Hook dw.ocapi.shop.basket.beforeGET functionality

/**
 * The function is called before the basket response had returned
 * Validates a pageId query string from request
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforeGET() {
    const validationHelper = require('~/cartridge/scripts/paypal/helpers/validationHelper');
    // Validates a 'pageId' query string
    if (!validationHelper.validateRequestStringValue(
        hooksHelper.createObjectFromQueryString().pageId)
        ) {
        return hooksHelper.createErrorStatus(Resource.msg('paypal.ocapi.error.querystring.pageid.invalid', 'locale', null));
    }
}


// Hook dw.ocapi.shop.basket.validateBasket functionality

/**
 * Validates whether a customer email exist in current basket, and add a flash in case if no
 * @param {BasketDocument} basketResponse The basket response to be validated
 */
function validateBasket(basketResponse) {
    // Initiates a custom 'CustomerEmailRequired' type to the flashes list
    if (!basketResponse.customerInfo.email) {
        basketResponse.addFlash({
            type: paypalConstants.CUSTOMER_EMAIL_REQUIRED_FLASH_TYPE,
            message: Resource.msg('paypal.ocapi.flash.customeremailrequired.message', 'locale', null),
            path: paypalConstants.CUSTOMER_EMAIL_REQUIRED_FLASH_PATH
        });
    }
}

exports.validateBasket = validateBasket;
exports.afterPOST = afterPOST;
exports.modifyGETResponse = modifyGETResponse;
exports.beforeGET = beforeGET;
