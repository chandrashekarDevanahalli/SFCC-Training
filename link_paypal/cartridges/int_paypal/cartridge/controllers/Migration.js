'use strict';

/* global request */

const server = require('server');

const Resource = require('dw/web/Resource');
const Transaction = require('dw/system/Transaction');
const CustomerMgr = require('dw/customer/CustomerMgr');
const AgentUserMgr = require('dw/customer/AgentUserMgr');

const {
    AUTHENTICATION_PAYPAL_PROVIDER_ID
} = require('*/cartridge/scripts/util/paypalConstants');

const {
    PP_CWPP_Agent_Login,
    PP_CWPP_Agent_Password
} = require('*/cartridge/config/paypalPreferences');

const {
    encodeString,
    createErrorMsg,
    createErrorLog
} = require('*/cartridge/scripts/paypal/paypalUtils');

const token = encodeString({
    PP_CWPP_Agent_Login: PP_CWPP_Agent_Login,
    PP_CWPP_Agent_Password: PP_CWPP_Agent_Password,
    PP_CWPP_Key: 'MergeAccountsPayPalAndSingleAuthentication'
});

server.post('RemovePayPalCustomer', server.middleware.https, function (_req, res, next) {
    const authorization = request.httpHeaders.get('authorization');

    if (authorization.indexOf(token) === -1) {
        res.setStatusCode(500);
        res.json({ status: false, message: createErrorMsg('invalid_token') });

        return next();
    }

    const profile = JSON.parse(request.httpParameterMap.requestBodyAsString);
    const errorMessage = Resource.msg('error.oauth.login.failure', 'login', null);

    try {
        const externalProfile = CustomerMgr.getExternallyAuthenticatedCustomerProfile(
            AUTHENTICATION_PAYPAL_PROVIDER_ID,
            profile.externalID
        );

        if (externalProfile) {
            if (AgentUserMgr.loginAgentUser(PP_CWPP_Agent_Login, PP_CWPP_Agent_Password).error) {
                throw errorMessage;
            }

            if (AgentUserMgr.loginOnBehalfOfCustomer(externalProfile.customer).error) {
                throw errorMessage;
            }

            Transaction.wrap(function () {
                CustomerMgr.removeCustomer(externalProfile.customer);
            });
        }
    } catch (error) {
        createErrorLog(error);

        res.setStatusCode(500);
        res.json({ status: false, message: createErrorMsg('remove_customers') });

        return next();
    }

    res.setStatusCode(200);
    res.json({ status: true, message: 'Success' });

    return next();
});

module.exports = server.exports();
