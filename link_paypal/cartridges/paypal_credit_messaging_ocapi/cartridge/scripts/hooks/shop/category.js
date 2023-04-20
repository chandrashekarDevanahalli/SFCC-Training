'use strict';

const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger');
const currentBasket = require('dw/order/BasketMgr').getCurrentBasket();
const currentSite = require('dw/system/Site').getCurrent();

const paypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const paypalPreferences = require('*/cartridge/config/paypalPreferences');
const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const creditMessageConfig = require('*/cartridge/config/creditMessageConfig');

/**
 * Returns a specific plp page config object
 * @returns {Object} An object
 */
function getPlpPageConfigs() {
    const creditMessageAvaliable = !paypalPreferences.billingAgreementEnabled && paypalPreferences.paypalPaymentMethodId && currentSite.getCustomPreferenceValue('PP_Show_On_Category');

    if (creditMessageAvaliable) {
        const creditMessageSdk = paypalUtils.createCreditMessageSDKUrl();
        const bannerSdkUrl = paypalHelper.isPaypalButtonEnabled(paypalConstants.MINICART_PAGE_ID) ? (paypalUtils.createCartSDKUrl()) : creditMessageSdk;

        return {
            paypal: {
                bannerSdkUrl: bannerSdkUrl,
                bannerConfig: creditMessageConfig.categoryMessageConfig,
                paypalAmount: currentBasket && currentBasket.totalGrossPrice.value
            },
            creditMessageAvaliable: creditMessageAvaliable
        };
    }
    return null;
}

/**
 * The hook that performs the adding of additional PayPal credit financial info when we search products
 * @param {dw.catalog.Category} _ object which represents chosen product category
 * @param {Object} documentResponse object which represents the response document we are modifying
 * @returns {Status} status of hook execution
**/
function modifyGETResponse(_, documentResponse) {
    try {
        documentResponse.c_paypalCategoryBannersConfig = getPlpPageConfigs();
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

exports.modifyGETResponse = modifyGETResponse;
