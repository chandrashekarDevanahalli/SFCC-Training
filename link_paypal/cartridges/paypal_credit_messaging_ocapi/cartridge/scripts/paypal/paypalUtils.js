'use strict';

const Resource = require('dw/web/Resource');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Logger = require('dw/system/Logger');

const PaypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const {
    billingAgreementEnabled,
    isCapture,
    enabledLPMs,
    partnerAttributionId,
    isVenmoEnabled,
    enableFundingList,
    disableFundingList
} = require('*/cartridge/config/paypalPreferences');

let {
    disableFunds,
    allowedCurrencies
} = require('*/cartridge/config/sdkConfig');

var paypalLogger;

/**
 * Gets the disabled funding sources
 *
 * @returns {array} of disbled funding sources
 */
function disabledPaymentOptions() {
    if (empty(enabledLPMs)) {
        return disableFunds;
    }
    var lpmMethods = enabledLPMs.map(function (lpm) {
        return lpm.toLowerCase();
    });

    if (empty(lpmMethods)) {
        return disableFunds;
    }

    disableFunds = disableFunds.filter(function (fund) {
        return Array.indexOf(lpmMethods, fund) === -1;
    });
    return disableFunds;
}

/**
 * Gets client id from cache if it exists or creates it, saves to cache and returns from cache
 *
 * @returns {string} with client id
 */
function getClientId() {
    var serviceName = 'int_paypal.http.rest';
    var restService = LocalServiceRegistry.createService(serviceName, {});
    return restService.configuration.credential.user;
}

/**
 * Determine if current currency supported by PP SDK
 * @param  {Array} allowedCurrenciesFromPP Allowed currencies for PP SDK
 * @param  {string} storeCurrency Current session currency
 * @returns {boolean} Currency match state
 */
function isAllowedCurrency(allowedCurrenciesFromPP, storeCurrency) {
    return allowedCurrenciesFromPP.some(function (allowedCurrency) {
        return allowedCurrency === storeCurrency;
    });
}

/**
 * Returns enable funding part of the SDK URL
 * @param  {string} url Current SDK URL
 * @param  {Boolen} isVenmoActive Checking if Venmo is active
 * @param  {Array} customEnableFundingList Additional currencies for enable-funding PP SDK
 * @returns {string} URL SDK with the necessary values in the part of enable-funding
 */
function addEnableFundigParam(url, isVenmoActive, customEnableFundingList) {
    var enableFundingKey = '&enable-funding=';
    var customEnableFundingArray;

    if (!empty(customEnableFundingList)) {
        customEnableFundingArray = customEnableFundingList.slice(0);
    } else {
        customEnableFundingArray = [];
    }

    if (isVenmoActive) {
        customEnableFundingArray.push('venmo');
    }

    if (!empty(customEnableFundingArray)) {
        return url + enableFundingKey + customEnableFundingArray.join(',');
    }
    return url;
}

/**
 * Returns disable funding part of the SDK URL
 * @param  {string} url Current SDK URL
 * @param  {Array} customDisableFundingList Additional currencies for disable-funding PP SDK
 * @returns {string} URL SDK with the necessary values in the part of disable-funding
 */
function addDisableFundigParam(url, customDisableFundingList) {
    var disableFundingKey = '&disable-funding=';
    var customDisableFundingArray = disabledPaymentOptions();

    if (!empty(customDisableFundingList)) {
        customDisableFundingList.forEach(element => {
            customDisableFundingArray.push(element);
        });
    }

    return url + disableFundingKey + customDisableFundingArray.join(',');
}

/**
 * Creates SDK url for paypal button on billing page based on payment action and client id
 *
 * @returns {string} created url
 */
function createBillingSDKUrl() {
    var clientID = getClientId();
    var currentCurrencyCode = session.currency.currencyCode;
    var sdkUrl = PaypalConstants.PAYPAL_SDK_HOST + clientID;
    var isActiveLPM = !billingAgreementEnabled && isCapture && !empty(enabledLPMs);
    var isActiveVenmo = !billingAgreementEnabled && isVenmoEnabled;

    sdkUrl += isActiveLPM ? '&commit=true' : '&commit=false';

    if (!isCapture && !billingAgreementEnabled) {
        sdkUrl += '&intent=authorize';
    }

    if (billingAgreementEnabled) {
        sdkUrl += '&vault=true';
    }

    if (isAllowedCurrency(allowedCurrencies, currentCurrencyCode)) {
        sdkUrl += '&currency=' + currentCurrencyCode;
    }

    sdkUrl = addEnableFundigParam(sdkUrl, isActiveVenmo, enableFundingList);
    sdkUrl = addDisableFundigParam(sdkUrl, disableFundingList);

    return sdkUrl;
}

/**
 * Creates SDK url for paypal button on cart page based on payment action and client id
 *
 * @returns {string} created url
 */
function createCartSDKUrl() {
    var clientID = getClientId();
    var currentCurrencyCode = session.currency.currencyCode;
    var isActiveVenmo = !billingAgreementEnabled && isVenmoEnabled;
    var sdkUrl = PaypalConstants.PAYPAL_SDK_HOST + clientID + '&commit=false&components=buttons,messages';

    if (!isCapture && !billingAgreementEnabled) {
        sdkUrl += '&intent=authorize';
    }

    if (billingAgreementEnabled) {
        sdkUrl += '&vault=true';
    }

    if (isAllowedCurrency(allowedCurrencies, currentCurrencyCode)) {
        sdkUrl += '&currency=' + currentCurrencyCode;
    }

    sdkUrl = addEnableFundigParam(sdkUrl, isActiveVenmo, enableFundingList);
    sdkUrl = addDisableFundigParam(sdkUrl, disableFundingList);

    return sdkUrl;
}

/**
 * Creates SDK url for paypal button on account page for vaulting based on client id
 *
 * @returns {string} created url
 */
function createAccountSDKUrl() {
    var clientID = getClientId();

    return PaypalConstants.PAYPAL_SDK_HOST + clientID + '&commit=false&vault=true&disable-funding=card,credit';
}

/**
 * Creates SDK url for paypal credit message banner based on client id
 *
 * @returns {string} created url
 */
function createCreditMessageSDKUrl() {
    const ClientID = getClientId();

    return PaypalConstants.PAYPAL_SDK_HOST + ClientID + PaypalConstants.PAYPAL_SDK_COMPONENTS_MESSAGES;
}

/**
 * Get logger instance
 *
 * @param {string} err Error message
 */
function createErrorLog(err) {
    paypalLogger = paypalLogger || Logger.getLogger('PayPal', 'PayPal_General');
    if (!empty(err)) {
        paypalLogger.error(err.stack ? (err.message + err.stack) : err);
    } else {
        paypalLogger.debug('Empty log entry');
    }
}

/**
 * Get the client-side URLs of a given page
 *
 * @returns {Object} An objects key key-value pairs holding the URLs
 */
function getUrls() {
    return {
        billingSdkUrl: createBillingSDKUrl(),
        cartSdkUrl: createCartSDKUrl(),
        partnerAttributionId: partnerAttributionId
    };
}

/**
 * Deprecated method, must to be modify.
 * Creates SDK url for paypal button on cart page based on payment action and client id
 *
 * @returns {string} created url
 */
function createSDKUrl() {
    const ClientID = getClientId();
    const CurrentCurrencyCode = session.currency.currencyCode;
    const IsActiveVenmo = !billingAgreementEnabled && isVenmoEnabled;
    let sdkUrl = PaypalConstants.PAYPAL_SDK_HOST + ClientID + '&commit=false&components=buttons,messages';

    if (!isCapture && !billingAgreementEnabled) {
        sdkUrl += '&intent=authorize';
    }

    if (billingAgreementEnabled) {
        sdkUrl += '&vault=true';
    }

    if (isAllowedCurrency(allowedCurrencies, CurrentCurrencyCode)) {
        sdkUrl += '&currency=' + CurrentCurrencyCode;
    }

    sdkUrl = addEnableFundigParam(sdkUrl, IsActiveVenmo, enableFundingList);
    sdkUrl = addDisableFundigParam(sdkUrl, disableFundingList);

    return sdkUrl;
}

/**
 * Creates the Error Message
 *
 * @param {string} errorName error message name
 * @returns {string} errorMsg - Resource error massage
 */
function createErrorMsg(errorName) {
    var defaultMessage = Resource.msg('paypal.error.general', 'paypalerrors', null);

    return Resource.msg('paypal.error.' + errorName, 'paypalerrors', defaultMessage);
}

/**
 * Creates a debug log message
 * @param {string} err Error message
 * @returns {void}
 */
function createDebugLog(err) {
    paypalLogger = paypalLogger || Logger.getLogger('PayPal', 'PayPal_General');
    paypalLogger.debug(err);
}

module.exports = {
    getClientId: getClientId,
    createErrorLog: createErrorLog,
    getUrls: getUrls,
    createErrorMsg: createErrorMsg,
    createBillingSDKUrl: createBillingSDKUrl,
    createCartSDKUrl: createCartSDKUrl,
    createAccountSDKUrl: createAccountSDKUrl,
    createCreditMessageSDKUrl: createCreditMessageSDKUrl,
    createSDKUrl: createSDKUrl,
    createDebugLog: createDebugLog
};
