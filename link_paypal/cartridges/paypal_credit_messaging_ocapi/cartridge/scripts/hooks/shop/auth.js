'use strict';

// SFCC API inclusions.
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

// Helpers and tools
const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const paypalPreferences = require('*/cartridge/config/paypalPreferences');
const paypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
const billingAgreementEnabled = paypalPreferences.billingAgreementEnabled;

/**
 * The hook that performs additional info about current registered customer
 * @param {dw.customer.Customer} customer the object which represents the current customer
 * @param {Object} customerResponse the object which represents the current response
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
**/
function modifyPOSTResponse(customer, customerResponse) {
    const payPalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
    const buttonConfigsHelper = require('*/cartridge/scripts/paypal/helpers/buttonConfigsHelper');

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
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

exports.modifyPOSTResponse = modifyPOSTResponse;
