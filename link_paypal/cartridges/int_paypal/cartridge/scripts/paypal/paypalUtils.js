
'use strict';

const server = require('server');

const Encoding = require('dw/crypto/Encoding');
const Bytes = require('dw/util/Bytes');
const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Logger = require('dw/system/Logger');
const Site = require('dw/system/Site');

const PAYPAL_SDK_LINK = 'https://www.paypal.com/sdk/js?client-id=';

const {
    billingAgreementEnabled,
    isCapture,
    enabledLPMs,
    partnerAttributionId,
    isVenmoEnabled,
    connectWithPaypalButtonUrl,
    enableFundingList,
    disableFundingList
} = require('*/cartridge/config/paypalPreferences');

var {
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
    const serviceName = 'int_paypal.http.rest';
    const restService = LocalServiceRegistry.createService(serviceName, {});
    // Returns client ID
    return restService.configuration.credential.user;
}
/**
 * Encodes purchase unit object into encoded string
 *
 * @param {Object} purchaseUnit purchase unit
 * @returns {string} encoded string
 */
function encodeString(purchaseUnit) {
    var bytes = new Bytes(JSON.stringify(purchaseUnit));
    return Encoding.toBase64(bytes);
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
    var sdkUrl = PAYPAL_SDK_LINK + clientID;
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
    var sdkUrl = [PAYPAL_SDK_LINK, clientID, '&commit=false&components=buttons,messages'].join('');

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

    return [PAYPAL_SDK_LINK, clientID, '&commit=false&vault=true&disable-funding=card,credit'].join('');
}

/**
 * Returns SDK url for Connect with Paypal button on Login page
 * @param {string} rurl rurl of the req.querystring
 * @returns {string} SDK Url
 */
function createConnectWithPaypalUrl(rurl) {
    var locale = Site.getCurrent().getDefaultLocale();
    var redirectUrl = [URLUtils.abs('Paypal-ConnectWithPaypal').toString(), '&state=', rurl].join('');
    var clientID = getClientId();

    return [connectWithPaypalButtonUrl, 'flowEntry=static&client_id=', clientID, '&locale=', locale, '&scope=openid profile email address&redirect_uri=', redirectUrl].join('');
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
 * Creates a debug log message
 * @param {string} err Error message
 * @returns {void}
 */
function createDebugLog(err) {
    paypalLogger = paypalLogger || Logger.getLogger('PayPal', 'PayPal_General');
    paypalLogger.debug(err);
}

/**
 * Get the client-side URLs of a given page
 *
 * @returns {Object} An objects key key-value pairs holding the URLs
 */
function getUrls() {
    return {
        getPurchaseUnit: URLUtils.https('Paypal-GetPurchaseUnit').toString(),
        getCartPurchaseUnit: URLUtils.https('Paypal-GetPurchaseUnit', 'isCartFlow', 'true').toString(),
        returnFromCart: URLUtils.https('Paypal-ReturnFromCart').toString(),
        cartPage: URLUtils.https('Cart-Show').toString(),
        billingSdkUrl: createBillingSDKUrl(),
        cartSdkUrl: createCartSDKUrl(),
        placeOrderStage: URLUtils.url('Checkout-Begin', 'stage', 'placeOrder').toString(),
        updateOrderData: URLUtils.url('Paypal-UpdateOrderDetails').toString(),
        createBillingAgreementToken: URLUtils.url('Paypal-GetBillingAgreementToken').toString(),
        createBillingAgreement: URLUtils.url('Paypal-CreateBillingAgreement').toString(),
        removeBillingAgreement: URLUtils.url('Paypal-RemoveBillingAgreement').toString(),
        saveBillingAgreement: URLUtils.url('Paypal-SaveBillingAgreement').toString(),
        getOrderDetails: URLUtils.url('Paypal-GetOrderDetails').toString(),
        paymentStage: URLUtils.https('Checkout-Begin', 'stage', 'payment').toString(),
        finishLpmOrder: URLUtils.url('Paypal-FinishLpmOrder').toString(),
        savePaypalDefaultAddress: URLUtils.url('Paypal-SavePaypalDefaultAddress').toString(),
        partnerAttributionId: partnerAttributionId
    };
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
 * Error handler for SubmitPayment endpoint
 * @param  {Object} req server request
 * @param  {Object} res server response
 * @param  {Error} error error instance
 * @param  {string} msg error text type for client
 * @returns {void}
 */
function errorHandle(req, res, error, msg) {
    if (error) {
        createErrorLog(error);
    }

    res.json({
        form: server.forms.getForm('billing'),
        fieldErrors: [],
        serverErrors: [createErrorMsg(msg)],
        error: true
    });
    this.emit('route:Complete', req, res);
}

module.exports = {
    getClientId: getClientId,
    createErrorLog: createErrorLog,
    encodeString: encodeString,
    getUrls: getUrls,
    createErrorMsg: createErrorMsg,
    createBillingSDKUrl: createBillingSDKUrl,
    createCartSDKUrl: createCartSDKUrl,
    createAccountSDKUrl: createAccountSDKUrl,
    errorHandle: errorHandle,
    createDebugLog: createDebugLog,
    createConnectWithPaypalUrl: createConnectWithPaypalUrl
};
