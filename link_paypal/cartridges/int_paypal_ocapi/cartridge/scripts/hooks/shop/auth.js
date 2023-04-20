'use strict';

// Helpers and tools
const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
const paypalPreferences = require('*/cartridge/config/paypalPreferences');
const paypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const billingAgreementEnabled = paypalPreferences.billingAgreementEnabled;

/**
 * The hook that performs additional info about current registered customer
 * @param {Object} customer the object which represents the current customer
 * @param {Object} customerResponse the object which represents the current response
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
**/
function modifyPOSTResponse(customer, customerResponse) {
    const payPalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
    const buttonConfigsHelper = require('*/cartridge/scripts/paypal/helpers/buttonConfigsHelper');
    const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');

    let payPalConfigs = {};

    try {
        if (customer.registered && billingAgreementEnabled) {
            const billingAgreementInstance = new BillingAgreementModel();

            payPalConfigs.accountPayPalConfigs = {
                billingAgreementEnabled: billingAgreementEnabled,
                isBaLimitReached: billingAgreementInstance.isBaLimitReached(),
                sdkUrl: paypalUtils.createAccountSDKUrl(),
                paypalUrls: JSON.stringify(paypalUtils.getUrls())
            };
        }
        // Sets PayPal button configs for Pdp page
        if (payPalHelper.isPayPalBtnEnabledOnPdpPage()) {
            payPalConfigs.pdpPayPalConfigs = buttonConfigsHelper.getPayPalConfigsForPdpPage();
        }

        customerResponse.c_paypal = payPalConfigs;
    } catch (error) {
        return hooksHelper.createErrorStatus(error);
    }
}

exports.modifyPOSTResponse = modifyPOSTResponse;
