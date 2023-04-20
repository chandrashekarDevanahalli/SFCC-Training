'use strict';

const server = require('server');

const Resource = require('dw/web/Resource');

const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const { getOrderByOrderNo } = require('*/cartridge/scripts/paypal/helpers/paypalHelper');
const { authorizationAndCaptureWhId } = require('*/cartridge/config/paypalPreferences');
const {
    createErrorLog,
    createDebugLog
} = require('*/cartridge/scripts/paypal/paypalUtils');

server.post('PaymentAuthorizationAndCaptureHook', function (_, res, next) {
    const AuthorizationAndCaptureWhMgr = require('*/cartridge/models/authorizationAndCaptureWhMgr');

    let authorizationAndCaptureWhMgr;
    let responseObject = {};

    try {
        const whEvent = JSON.parse(request.httpParameterMap.requestBodyAsString);
        const eventType = whEvent.event_type;
        const eventResource = whEvent.resource;
        authorizationAndCaptureWhMgr = new AuthorizationAndCaptureWhMgr();

        // Cheks if endpoint received an appropriate event
        const isApproppriateEventType = authorizationAndCaptureWhMgr.isApproppriateEventType(eventType);

        // Throws an error and stop procced the rest of logic
        if (!isApproppriateEventType) {
            authorizationAndCaptureWhMgr.logEventError(eventType, this.name);
        }

        // Verify webhook event notifications
        const verifiedResponse = authorizationAndCaptureWhMgr.verifyWhSignature(whEvent, request.httpHeaders, authorizationAndCaptureWhId);
        const verificationStatus = verifiedResponse.verification_status;

        if (verificationStatus === paypalConstants.STATUS_SUCCESS) {
            const orderNo = eventResource.invoice_id;
            const paymentStatus = eventResource.status;

            if (!orderNo || !paymentStatus) {
                throw Resource.msg('paypal.webhook.order.details.error', 'paypalerrors', null);
            }

            // Gets order needed to update payment status
            const order = getOrderByOrderNo(orderNo);

            if (!order) {
                const orderErrorMsg = Resource.msg('paypal.webhook.order.notexist.error', 'paypalerrors', null);
                createDebugLog(orderErrorMsg);

                responseObject.error = orderErrorMsg;
                responseObject.success = false;
                res.json(responseObject);

                return next();
            }

            // Handles different WebHook scenarios in depends of received webHook event
            switch (eventType) {
                case paypalConstants.PAYMENT_AUTHORIZATION_VOIDED:
                    authorizationAndCaptureWhMgr.voidPaymentOnDwSide(order, paymentStatus);
                    break;
                case paypalConstants.PAYMENT_CAPTURE_REFUNDED:
                    authorizationAndCaptureWhMgr.refundPaymentOnDwSide(order, paypalConstants.PAYMENT_STATUS_REFUNDED);
                    break;
                case paypalConstants.PAYMENT_CAPTURE_COMPLETED:
                    authorizationAndCaptureWhMgr.completePaymentOnDwSide(order, paymentStatus);
                    break;
                default:
                    break;
            }
        } else {
            throw Resource.msgf('paypal.webhook.verified.error', 'paypalerrors', null, verificationStatus);
        }
    } catch (err) {
        responseObject.error = err;
        responseObject.success = false;

        res.json(responseObject);

        createErrorLog(err);

        return next();
    }

    res.setStatusCode(200);
    responseObject.success = true;
    res.json(responseObject);

    return next();
});

module.exports = server.exports();
