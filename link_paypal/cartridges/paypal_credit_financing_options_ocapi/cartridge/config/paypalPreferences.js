'use strict';

const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');

/**
 * Returns paypal payment method ID
 * @returns {string} active paypal payment method id
 */
function getPaypalPaymentMethodId() {
    const PaymentMgr = require('dw/order/PaymentMgr');
    const activePaymentMethods = PaymentMgr.getActivePaymentMethods();
    let paypalPaymentMethodID;

    Array.some(activePaymentMethods, function (paymentMethod) {
        if (paymentMethod.paymentProcessor.ID === paypalConstants.ALLOWED_PROCESSOR_ID) {
            paypalPaymentMethodID = paymentMethod.ID;
            return true;
        }
        return false;
    });

    return paypalPaymentMethodID;
}

/**
 *  Returns PayPal custom and hardcoded preferences
 *
 * @returns {Object} statis preferences
 */
function getPreferences() {
    const site = require('dw/system/Site').current;
    const sdkConfig = require('./sdkConfig');

    return {
        partnerAttributionId: 'SFCC_EC_B2C_2022_1_0',
        isCapture: site.getCustomPreferenceValue('PP_API_PaymentAction'),
        billingAgreementEnabled: site.getCustomPreferenceValue('PP_API_BA_Enabled'),
        billingAgreementDescription: site.getCustomPreferenceValue('PP_API_BA_Description'),
        paypalPaymentMethodId: getPaypalPaymentMethodId(),
        paypalButtonLocation: site.getCustomPreferenceValue('PP_API_Button_Location').getValue(),
        paypalPdpButtonConfig: sdkConfig.paypalPdpButtonConfig,
        paypalCartButtonConfig: sdkConfig.paypalCartButtonConfig,
        paypalBillingButtonConfig: sdkConfig.paypalBillingButtonConfig,
        paypalMinicartButtonConfig: sdkConfig.paypalMinicartButtonConfig,
        paypalStaticImageLink: sdkConfig.paypalStaticImageLink,
        enabledLPMs: site.getCustomPreferenceValue('PP_API_APM_methods'),
        authorizationAndCaptureWhId: site.getCustomPreferenceValue('PP_WH_Authorization_And_Capture_Id')
    };
}

module.exports = getPreferences();
