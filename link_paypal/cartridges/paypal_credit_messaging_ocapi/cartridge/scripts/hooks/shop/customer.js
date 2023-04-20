'use strict';

const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');
const Resource = require('dw/web/Resource');

const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

/**
 * The hook that performs the adding of a payment instrument on the Braintree side
 * @returns {Object} returns a custom error object in a case of mistake with required query parameters
**/
function beforeGET() {
    try {
        const queryParams = hooksHelper.createObjectFromQueryString();

        if (!request.session.customer.authenticated) {
            throw new Error(Resource.msgf('paypal.incorrect.stage.query.parameter.value.error', 'paypalerrors', null, queryParams.stage));
        }

        if (!empty(queryParams) && queryParams.key === paypalConstants.STAGE_QUERY_PARAMETER) {
            if (!paypalConstants.ALLOWED_STAGE_QUERY_PARAMETERS.includes(queryParams.stage)) {
                throw new Error(Resource.msg('paypal.incorrect.query.parameter.value.error', 'paypalerrors', null));
            }
        }
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

/**
 * The hook that performs the adding of billing agreement
 * @param {dw.customer.Customer} _ the object which represents the current customer
 * @param {Object} customerResponse the object which represents the current response
 * @returns {Status} returns an error object in a case of mistake
**/
function modifyGETResponse(_, customerResponse) {
    try {
        const queryParams = hooksHelper.createObjectFromQueryString();

        if (queryParams.stage === paypalConstants.CREATE_BA_TOKEN_QUERY_PARAMETER) {
            const isBillingPage = false;
            const billingAgreementTokenObject = paypalApi.getBillingAgreementToken(
                paypalHelper.getBARestData(isBillingPage)
            );
            const billingAgreementToken = billingAgreementTokenObject.billingAgreementToken;

            if (billingAgreementToken) {
                customerResponse.c_billingAgreementToken = billingAgreementToken;
            } else {
                throw billingAgreementTokenObject.err;
            }
        }
    } catch (error) {
        Logger.error(error);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, error);
    }
}

exports.beforeGET = beforeGET;
exports.modifyGETResponse = modifyGETResponse;
