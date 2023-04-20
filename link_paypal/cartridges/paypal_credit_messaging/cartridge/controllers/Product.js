'use strict';

const page = module.superModule;
const server = require('server');

const Site = require('dw/system/Site');

const {
    getClientId,
    createCartSDKUrl
} = require('*/cartridge/scripts/paypal/paypalUtils');

const {
    isPaypalButtonEnabled
} = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

const {
    productDetailMessageConfig
} = require('*/cartridge/config/creditMessageConfig');

const {
    addEnableFundigParamPaylater
} = require('*/cartridge/scripts/helpers/enableFundingHelper');

const {
    paypalPaymentMethodId,
    billingAgreementEnabled
} = require('*/cartridge/config/paypalPreferences');

server.extend(page);

server.append('Show', function (req, res, next) {
    var currentSite = Site.getCurrent();
    var paypal = res.getViewData().paypal;
    var sdkUrl = paypal.sdkUrl;
    var creditMessageAvaliable = !billingAgreementEnabled && paypalPaymentMethodId && currentSite.getCustomPreferenceValue('PP_Show_On_PDP');

    paypal.sdkUrl = addEnableFundigParamPaylater(sdkUrl);

    if (creditMessageAvaliable) {
        var clientID = getClientId();
        var creditMessageSdk = 'https://www.paypal.com/sdk/js?client-id=' + clientID + '&components=messages';
        var bannerSdkUrl = (isPaypalButtonEnabled('pdp') || isPaypalButtonEnabled('minicart')) ? (createCartSDKUrl()) : creditMessageSdk;

        res.setViewData({
            bannerSdkUrl: bannerSdkUrl,
            bannerConfig: productDetailMessageConfig,
            creditMessageAvaliable: creditMessageAvaliable,
            paypal: paypal
        });
    }

    next();
});

module.exports = server.exports();
