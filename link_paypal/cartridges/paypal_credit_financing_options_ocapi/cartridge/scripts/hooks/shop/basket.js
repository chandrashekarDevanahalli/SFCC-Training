'use strict';
const Resource = require('dw/web/Resource');
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

// Helpers and tools
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const validationHelper = require('~/cartridge/scripts/paypal/helpers/validationHelper');
const creditFinancialOptionsHelper = require('*/cartridge/scripts/paypal/paypalCreditFinancingOptionsHelper');
const hookHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
const financialPreferences = require('~/cartridge/config/financialPreferences');

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
    try {
        setDefaultShippingMethod(basket)
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

// Hook dw.ocapi.shop.product.beforeGET functionality

/**
 * The hook that performs validation of request query prameters
 * @returns {Status} returns a custom error object in a case of mistake with required query parameters
**/
function beforeGET() {
    try {
        const queryParamsObject = hookHelper.createObjectFromQueryString(request.httpQueryString);

        if (financialPreferences.isActive && !validationHelper.isEmptyObject(queryParamsObject)) {
            const queryParams = Object.keys(queryParamsObject);

            if (!queryParams.includes(paypalConstants.QUERY_PARAMETER_CURRENCY_CODE) || 
                !queryParams.includes(paypalConstants.QUERY_PARAMETER_COUNTRY_CODE) || 
                !queryParams.includes(paypalConstants.QUERY_PARAMETER_PAGE_ID)) {

                throw new Error(Resource.msg('paypal.query.parameter.not.allowed.name.error', 'paypalerrors', null))
            }

            if (queryParamsObject.countryCode !== paypalConstants.QUERY_PARAMETER_COUNTRY_CODE_VALUE) {
                throw new Error(Resource.msg('paypal.query.parameter.not.allowed.countryCode.error', 'paypalerrors', null))
            }

            if (queryParamsObject.currencyCode !== paypalConstants.QUERY_PARAMETER_CURRENCY_CODE_VALUE) {
                throw new Error(Resource.msg('paypal.query.parameter.not.allowed.currencyCode.error', 'paypalerrors', null))
            }

            if (!paypalConstants.ALLOWED_QUERY_PARAMETER_PAGE_IDS.includes(queryParamsObject.pageId)) {
                throw new Error(Resource.msg('paypal.query.parameter.not.allowed.pageId.error', 'paypalerrors', null))
            }
        }
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
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
 * The function modify get response by adding custom attributes
 * Used in the follwing resource: /baskets
 * @param {dw.order.Basket} basket The current basket
 * @param {basketResponse} basketResponse Document representing a basket.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function modifyGETResponse(basket, basketResponse) {
    const site = require('dw/system/Site').current;
    const buttonConfigsHelper = require('*/cartridge/scripts/paypal/helpers/buttonConfigsHelper');

    try {
        const queryParamsObject = hookHelper.createObjectFromQueryString(request.httpQueryString);
        const isBillingPage = queryParamsObject.pageId === paypalConstants.PAGE_FLOW_BILLING;
        const currencyCode = queryParamsObject.currencyCode;
        const countryCode = queryParamsObject.countryCode;
        const pageId = queryParamsObject.pageId;
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
        } else if (site.getCustomPreferenceValue('PP_API_BA_Enabled')) {
            // Billing agreement enabled flow
            billingAgreementFlow(basketResponse, isBillingPage);
        } else {
            // Billing agreement disabled flow
            basketResponse.c_purchaseUnit = paypalHelper.getPurchaseUnit(basket, isBillingPage);
        }
        // Sets a PayPal credit bunner configs for current page
        if (financialPreferences.isActive && !validationHelper.isEmptyObject(queryParamsObject)) {
            const price = basket.totalGrossPrice.value;
            let allOptionsData = creditFinancialOptionsHelper.getDataForAllOptionsBanner(price, currencyCode, countryCode);
            const lowestPossibleMonthlyCost = creditFinancialOptionsHelper.getLowestPossibleMonthlyCost(price, currencyCode, countryCode);
        
            allOptionsData.lowestPossibleMonthlyCost = {
                value: lowestPossibleMonthlyCost.value,
                currencyCode: lowestPossibleMonthlyCost.currencyCode,
                formatted: lowestPossibleMonthlyCost.formatted
            };
            // Adding c_allOptionsData property for basket response
            basketResponse.c_allOptionsData = allOptionsData;
        }
        basketResponse.c_financialPreferences = financialPreferences;
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
    try {
        // Initiates a custom 'CustomerEmailRequired' type to the flashes list
        if (!basketResponse.customerInfo.email) {
            basketResponse.addFlash({
                type: paypalConstants.CUSTOMER_EMAIL_REQUIRED_FLASH_TYPE,
                message: Resource.msg('paypal.ocapi.flash.customeremailrequired.message', 'locale', null),
                path: paypalConstants.CUSTOMER_EMAIL_REQUIRED_FLASH_PATH
            });
        }
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

exports.validateBasket = validateBasket;
exports.afterPOST = afterPOST;
exports.beforeGET = beforeGET;
exports.modifyGETResponse = modifyGETResponse;
