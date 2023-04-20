'use strict';

const serviceName = 'int_paypal.http.rest';
const ServiceCredential = require('dw/svc/ServiceCredential');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Resource = require('dw/web/Resource');
const tokenCache = require('dw/system/CacheMgr').getCache('paypalRestOauthToken');

const paypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const paypalHelper = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

/**
 * Create and store oauth token
 * @param  {dw.svc.Service} service current service based on serviceName
 * @returns {string} oauth token
 */
function getToken(service) {
    const bearerToken = tokenCache.get('token');
    if (bearerToken) {
        return 'Bearer ' + bearerToken;
    }

    service.setThrowOnError().call({
        createToken: true
    });

    const { error_description, access_token } = service.response;
    if (!error_description && access_token) {
        tokenCache.put('token', access_token);
        return 'Bearer ' + access_token;
    }

    if (error_description) {
        throw new Error(error_description);
    } else {
        throw new Error('Unknown error occurred');
    }
}

/** createRequest callback for a service
 * @param  {dw.svc.Service} service service instance
 * @param  {Object} data call data with path, method, body for a call or createToken in case of recursive call
 * @returns {string} request body
 */
function createRequest(service, data) {
    const credential = service.configuration.credential;
    if (!(credential instanceof ServiceCredential)) {
        throw new Error(
            Resource.msgf(
                'service.nocredentials',
                'paypalerrors',
                null,
                serviceName
            )
        );
    }
    const { path, method, body, createToken, partnerAttributionId } = data;

    // recursive part for create token call
    if (createToken) {
        service.setRequestMethod('POST');
        service.setURL(
            paypalHelper.getUrlPath(
                credential,
                'v1/oauth2/token?grant_type=client_credentials'
            )
        );
        service.addHeader('Content-Type', 'application/x-www-form-urlencoded');
        return '';
    }

    const token = getToken(service);
    service.setURL(paypalHelper.getUrlPath(credential, path));
    service.addHeader('Content-Type', 'application/json');
    service.setRequestMethod(method || 'POST');
    service.addHeader('Authorization', token);

    if (partnerAttributionId) {
        service.addHeader(
            'PayPal-Partner-Attribution-Id',
            partnerAttributionId
        );
    }
    return body ? JSON.stringify(body) : '';
}

/** Create service
 * @returns {dw.svc.Service} service instance
 */
function initService() {
    return LocalServiceRegistry.createService(serviceName, {
        createRequest: createRequest,
        parseResponse: function (_, httpClient) {
            return JSON.parse(httpClient.getText());
        },
        filterLogMessage: function (msg) {
            return msg;
        },
        getRequestLogMessage: function (request) {
            return request;
        },
        getResponseLogMessage: function (response) {
            return response.text;
        }
    });
}

/** Handle error
 * @param  {Object} errorResponse service result object with error status
 * @param  {Object} requestData data for request
 */
function errorHandler(errorResponse, requestData) {
    if (!errorResponse.errorMessage) {
        paypalUtils.createErrorLog(Resource.msgf('service.wrongendpoint', 'paypalerrors', null, requestData.path));
        throw new Error();
    }

    const errorData = JSON.parse(errorResponse.errorMessage);
    let errorName;
    let errorDescription;

    // For type error ex -> {"error", "error_description"}
    if (errorData.error) {
        errorName = errorData.error;
        errorDescription = errorData.error_description;
    } else {
        // For error details with issue -> {"name", "message", "details": [{"issue", "description"}]}
        errorName = errorData.details && errorData.details.length ? errorData.details[0].issue : errorData.name;
        errorDescription = errorData.details && errorData.details.length ? errorData.details[0].description : errorData.message;
    }

    errorName.toLowerCase() === 'invalid_client'
        ? paypalUtils.createErrorLog(Resource.msgf('service.wrongcredentials', 'paypalerrors', null, errorResponse.configuration.credential.ID))
        : paypalUtils.createErrorLog(errorDescription);

    throw new Error(errorName.toLowerCase());
}

/** Exports IIF and it returns object with call function for making a service call
 * @param  {Object} data data for making request
 * @param  {Object} object with call function
 */
module.exports = (function () {
    let restService;

    try {
        restService = initService();
    } catch (error) {
        paypalUtils.createErrorLog(Resource.msgf('service.error', 'paypalerrors', null, serviceName));
        throw new Error(error);
    }

    return {
        call: function (data) {
            const result = restService.call(data);

            if (!result.isOk()) {
                errorHandler(result, data);
            }

            return result.object;
        }
    };
}());
