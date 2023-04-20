'use strict';

/**
 *  Returns PayPal custom and hardcoded preferences
 *
 * @returns {Object} statis preferences
 */
function getPreferences() {
    const currentSite = require('dw/system/Site').current;
    const sdkConfig = require('./sdkConfig');

    return {
        enabledLPMsArray: currentSite.getCustomPreferenceValue('PP_API_APM_methods').map(function (lpm) {
            return lpm.toLowerCase();
        }),
        paypalPdpButtonConfig: sdkConfig.paypalPdpButtonConfig,
        paypalCartButtonConfig: sdkConfig.paypalCartButtonConfig,
        paypalBillingButtonConfig: sdkConfig.paypalBillingButtonConfig,
        paypalMinicartButtonConfig: sdkConfig.paypalMinicartButtonConfig,
        paypalStaticImageLink: sdkConfig.paypalStaticImageLink,
        paypalButtonLocation: currentSite.getCustomPreferenceValue('PP_API_Button_Location').getValue(),
        partnerAttributionId: 'SFCC_EC_B2C_2022_1_0',
        isCapture: currentSite.getCustomPreferenceValue('PP_API_PaymentAction'),
        billingAgreementEnabled: currentSite.getCustomPreferenceValue('PP_API_BA_Enabled'),
        billingAgreementDescription: currentSite.getCustomPreferenceValue('PP_API_BA_Description'),
        authorizationAndCaptureWhId: currentSite.getCustomPreferenceValue('PP_WH_Authorization_And_Capture_Id')
    };
}

module.exports = getPreferences();
