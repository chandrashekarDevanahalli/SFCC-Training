'use strict';

const Resource = require('dw/web/Resource');
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
const creditFinancialOptionsHelper = require('*/cartridge/scripts/paypal/paypalCreditFinancingOptionsHelper');
const validationHelper = require('~/cartridge/scripts/paypal/helpers/validationHelper');
const financialPreferences = require('~/cartridge/config/financialPreferences');
const { createObjectFromQueryString } = require('*/cartridge/scripts/paypal/helpers/hooksHelper');

// Hook dw.ocapi.shop.product.beforeGET functionality

/**
 * The hook that performs validation of query prameters
 * @returns {Status} returns a custom error object in a case of mistake with required query parameters
**/
function beforeGET() {
    try {
        const queryParamsObject = createObjectFromQueryString(request.httpQueryString);

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

// Hook dw.ocapi.shop.product.modifyGETResponse functionality

/**
 * The function is called for product result response modifying
 * Add custom property c_lowerPricePerMonth to product
 * @param {dw.catalog.Product} product product result
 * @param {Object} productResponse product response document for modifying
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function modifyGETResponse(product, productResponse) {
    try {
        const queryParamsObject = createObjectFromQueryString(request.httpQueryString);

        if (financialPreferences.isActive && !validationHelper.isEmptyObject(queryParamsObject)) {
            const currencyCode = queryParamsObject.currencyCode;
            const countryCode = queryParamsObject.countryCode;
            const pageId = queryParamsObject.pageId;

            if (pageId === paypalConstants.PAGE_FLOW_PLP) {
                const minPrice = product.priceModel.minPrice.value || product.priceModel.minPricePerUnit.value;
                // Adding c_lowestPossibleMonthlyCost property in a scope of PLP flow
                productResponse.c_lowestPossibleMonthlyCost = creditFinancialOptionsHelper.getLowestPossibleMonthlyCost(minPrice, currencyCode, countryCode);
            } else if (pageId === paypalConstants.PAGE_FLOW_PDP && product.priceModel.price.value && product.priceModel.price.value !== 0) {
                const price = product.priceModel.price.value;

                let allOptionsData = creditFinancialOptionsHelper.getDataForAllOptionsBanner(price, currencyCode, countryCode);
                const lowestPossibleMonthlyCost = creditFinancialOptionsHelper.getLowestPossibleMonthlyCost(price, currencyCode, countryCode);
            
                allOptionsData.lowestPossibleMonthlyCost = {
                    value: lowestPossibleMonthlyCost.value,
                    currencyCode: lowestPossibleMonthlyCost.currencyCode,
                    formatted: lowestPossibleMonthlyCost.formatted
                };
                // Adding c_allOptionsData property in a scope of PDP flow
                productResponse.c_allOptionsData = allOptionsData;
            }
        }
        productResponse.c_financialPreferences = financialPreferences;
        
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

exports.beforeGET = beforeGET;
exports.modifyGETResponse = modifyGETResponse;
