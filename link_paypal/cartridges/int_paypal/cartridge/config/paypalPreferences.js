'use strict';

const allowedProcessorsIds = 'PAYPAL';
const PaymentMgr = require('dw/order/PaymentMgr');
const Site = require('dw/system/Site');

const {
    paypalCartButtonConfig,
    paypalBillingButtonConfig,
    paypalPdpButtonConfig,
    paypalMinicartButtonConfig,
    paypalStaticImageLink,
    connectWithPaypalStaticImageLink
} = require('./sdkConfig');

/**
 * Returns paypal payment method ID
 * @returns {string} active paypal payment method id
 */
function getPaypalPaymentMethodId() {
    var activePaymentMethods = PaymentMgr.getActivePaymentMethods();
    var paypalPaymentMethodID;

    Array.some(activePaymentMethods, function (paymentMethod) {
        if (paymentMethod.paymentProcessor.ID === allowedProcessorsIds) {
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
    const site = Site.current;

    return {
        isCapture: site.getCustomPreferenceValue('PP_API_PaymentAction'),
        paypalPaymentMethodId: getPaypalPaymentMethodId(),
        billingAgreementEnabled: site.getCustomPreferenceValue('PP_API_BA_Enabled'),
        billingAgreementDescription: site.getCustomPreferenceValue('PP_API_BA_Description'),
        enabledLPMs: site.getCustomPreferenceValue('PP_API_APM_methods'),
        paypalButtonLocation: site.getCustomPreferenceValue('PP_API_Button_Location').getValue(),
        authorizationAndCaptureWhId: site.getCustomPreferenceValue('PP_WH_Authorization_And_Capture_Id'),
        isVenmoEnabled: site.getCustomPreferenceValue('PP_API_Venmo_Enabled'),
        connectWithPaypalButtonUrl: site.getCustomPreferenceValue('PP_Connect_With_Paypal_Button_Url'),
        paypalCartButtonConfig: paypalCartButtonConfig,
        paypalBillingButtonConfig: paypalBillingButtonConfig,
        paypalPdpButtonConfig: paypalPdpButtonConfig,
        paypalMinicartButtonConfig: paypalMinicartButtonConfig,
        paypalProcessorId: allowedProcessorsIds,
        paypalStaticImageLink: paypalStaticImageLink,
        connectWithPaypalStaticImageLink: connectWithPaypalStaticImageLink,
        partnerAttributionId: 'SFCC_EC_B2C_2022_1_0',
        enableFundingList: site.getCustomPreferenceValue('PP_Enable_Funding_List'),
        disableFundingList: site.getCustomPreferenceValue('PP_Disable_Funding_List'),
        automaticPmAddingEnabled: site.getCustomPreferenceValue('PP_Automatic_PM_adding_enabled'),
        PP_CWPP_Agent_Login: site.getCustomPreferenceValue('PP_CWPP_Agent_Login'),
        PP_CWPP_Agent_Password: site.getCustomPreferenceValue('PP_CWPP_Agent_Password')
    };
}

module.exports = getPreferences();
