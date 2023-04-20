'use strict';

const Logger = require('dw/system/Logger');
// Helpers and tools
const currentSite = require('dw/system/Site').getCurrent();
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const creditMessageConfig = require('*/cartridge/config/creditMessageConfig');
const paypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const paypalPreferences = require('*/cartridge/config/paypalPreferences');
const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');

// Hook dw.ocapi.shop.basket.afterPOST functionality

/**
 * Sets a default site shipping method to the default basket shipment
 * @param {dw.order.Basket} basket The current basket
 */
function setDefaultShippingMethod(basket) {
    const ShippingMgr = require('dw/order/ShippingMgr');
    const defaultShippingMethod = ShippingMgr.getDefaultShippingMethod();

    basket.shipments[0].setShippingMethod(defaultShippingMethod);
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
 * @param {basketResponse} basketResponse Document representing a basket.
 * @param {string} isBillingPage True/false
 */
function billingAgreementFlow(basketResponse, isBillingPage) {
    const billingAgreementTokenObject = paypalApi.getBillingAgreementToken(
        paypalHelper.getBARestData(isBillingPage)
    );
    const billingAgreementToken = billingAgreementTokenObject.billingAgreementToken;

    if (billingAgreementToken) {
        basketResponse.c_billingAgreementToken = billingAgreementToken;
    } else {
        throw billingAgreementTokenObject.err;
    }
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
 * Returns a specific cart / minicart page config object
 * @returns {Object} An object
 */
function getCartPageConfigs() {
    const creditMessageAvaliable = !paypalPreferences.billingAgreementEnabled && paypalPreferences.paypalPaymentMethodId && currentSite.getCustomPreferenceValue('PP_Show_On_Cart');

    if (creditMessageAvaliable) {
        const currentBasket = require('dw/order/BasketMgr').getCurrentBasket();
        const clientID = paypalUtils.getClientId();
        const bannerSdkUrl = paypalConstants.PAYPAL_SDK_HOST + clientID + paypalConstants.PAYPAL_SDK_COMPONENTS_MESSAGES;

        return {
            paypal: {
                bannerSdkUrl: bannerSdkUrl,
                bannerConfig: creditMessageConfig.cartMessageConfig,
                paypalAmount: currentBasket && currentBasket.totalGrossPrice.value
            },
            creditMessageAvaliable: creditMessageAvaliable
        };
    }
    return null;
}

/**
 * The function modify get response by adding custom attributes
 * Used in the follwing resource: /baskets
 * @param {dw.order.Basket} basket The current basket
 * @param {basketResponse} basketResponse Document representing a basket.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function modifyGETResponse(basket, basketResponse) {
    const Status = require('dw/system/Status');
    const buttonConfigsHelper = require('*/cartridge/scripts/paypal/helpers/buttonConfigsHelper');
    const hookHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');

    const createObjectFromQueryString = hookHelper.createObjectFromQueryString;

    try {
        const isBillingPage = createObjectFromQueryString(request.httpQueryString).isBillingPage === 'true';
        const pageId = createObjectFromQueryString(request.httpQueryString).pageId;
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
        } else if (currentSite.getCustomPreferenceValue('PP_API_BA_Enabled')) {
            // Billing agreement enabled flow
            billingAgreementFlow(basketResponse, isBillingPage);
        } else {
            // Billing agreement disabled flow
            basketResponse.c_purchaseUnit = paypalHelper.getPurchaseUnit(basket, isBillingPage);
        }
        // Add credit banners configuration
        basketResponse.c_paypalCartBannersConfig = getCartPageConfigs();
    } catch (err) {
        Logger.error(err);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, err);
    }
}

// Hook dw.ocapi.shop.basket.validateBasket functionality

/**
 * Validates whether a customer email exist in current basket, and add a flash in case if no
 * @param {BasketDocument} basketResponse The basket response to be validated
 */
function validateBasket(basketResponse) {
    const Resource = require('dw/web/Resource');
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
