'use strict';

const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
const {
    getPurchaseUnit,
    isLpmUsed
} = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

/**
 * Create a request body object for createOrder call with BA
 * @param  {dw.order.OrderPaymentInstrument} paymentInstrument current active paypal payment instrument
 * @returns {Object} body for request
 */
function createBAReqBody(paymentInstrument) {
    const activeBillingAgreement = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement);
    const billingAgreementId = activeBillingAgreement.baID;

    return {
        payment_source: {
            token: {
                id: billingAgreementId,
                type: paypalConstants.BILLING_AGREEMENT_TYPE
            }
        }
    };
}

/**
 * Get transaction id from transaction response
 * @param  {Object} transactionResponse Response from call
 * @returns {string} Transaction id from response
 */
function getTransactionId(transactionResponse) {
    const payments = transactionResponse.purchase_units[0].payments;

    return payments.captures ?
        payments.captures[0].id :
        payments.authorizations[0].id;
}

/**
 * Get transaction status from transaction response
 * @param  {Object} transactionResponse Response from call
 * @returns {string} Transaction status from response
 */
function getTransactionStatus(transactionResponse) {
    const payments = transactionResponse.purchase_units[0].payments;

    let transactionStatus = payments.captures ? payments.captures[0].status : payments.authorizations[0].status;

    if (payments.authorizations && payments.authorizations[0].status === paypalConstants.TRANSACTION_STATUS_CAPTURED && !payments.refunds) {
        transactionStatus = payments.authorizations[0].status;
    }

    return transactionStatus;
}

/**
 * Deprecated method, must to be modify.
 * Authorize a PayPal transaction
 * @param {dw.order.Order} order The current Order
 * @param {dw.order.PaymentInstrument} paymentInstrument The order payment instrument
 * @returns {Object} custom authorize object
 */
function authorize(order, paymentInstrument) {
    const {
        updateOrderDetails,
        createOrder,
        createTransaction
    } = require('*/cartridge/scripts/paypal/paypalApi');
    const {
        createErrorLog
    } = require('*/cartridge/scripts/paypal/paypalUtils');

    // We send true as a second argument, because on this step(checkout-billing page) shipping address is always exist
    const purchaseUnit = getPurchaseUnit(order, true);

    let bodyObj;

    if (paymentInstrument.paymentTransaction.amount.value === 0) {
        return {
            authorized: false,
            error: true,
            message: Resource.msg('paypal.zero.amount.erro', 'paypalerrors', null)
        };
    }

    if (paymentInstrument.custom.paypalOrderID) {
        let {
            err: updateOrderDetailsError
        } = updateOrderDetails(paymentInstrument, purchaseUnit);

        if (updateOrderDetailsError) {
            return {
                authorized: false,
                error: true,
                message: updateOrderDetailsError
            };
        }
    }

    if (paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
        let {
            resp,
            err: createOrderError
        } = createOrder(purchaseUnit);

        if (createOrderError) {
            return {
                authorized: false,
                error: true,
                message: createOrderError
            };
        }

        paymentInstrument.custom.paypalOrderID = resp.id;

        try {
            bodyObj = createBAReqBody(paymentInstrument);
        } catch (err) {
            createErrorLog(err);
            return {
                error: true,
                authorized: false,
                message: err
            };
        }
    }

    let {
        response,
        err: createTransactionError
    } = createTransaction(paymentInstrument, bodyObj);

    if (createTransactionError) {
        return {
            error: true,
            authorized: false,
            message: createTransactionError
        };
    }

    const transactionId = getTransactionId(response);

    paymentInstrument.getPaymentTransaction().setTransactionID(transactionId);
    paymentInstrument.custom.paypalPaymentStatus = getTransactionStatus(response);
    order.custom.paypalPaymentMethod = paypalConstants.PAYMENT_METHOD_ID_EXPRESS;
    order.custom.PP_API_TransactionID = transactionId;

    return {
        authorized: true
    };
}

/**
 * Handles a PayPal payment instrument
 * @param {dw.order.Order} order The current Order
 */
function handlePayment(order) {
    order.paymentInstruments.toArray().forEach(function (paymentInstrument) {
        // We do not need to make transaction for LPM
        // LPM is captured during the customer session through PayPal window
        if (!isLpmUsed(paymentInstrument.custom.paymentId) &&
            paymentInstrument.paymentMethod === paypalConstants.PAYMENT_METHOD_ID_PAYPAL) {
            authorize(order, paymentInstrument);
        }
    });
}

/**
 * The function is called after an order was created from the basket.
 * Finish order on PayPal side
 * @param {dw.order.Order} order The current Order
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function afterPOST(order) {
    const Status = require('dw/system/Status');
    const OrderMgr = require('dw/order/OrderMgr');
    const Order = require('dw/order/Order');
    const Logger = require('dw/system/Logger');

    try {
        // Handles the payment authorization for PayPal payment instrument
        handlePayment(order);

        // Attempts to place the order
        const placeOrderStatus = OrderMgr.placeOrder(order);

        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        order.setExportStatus(Order.EXPORT_STATUS_READY);
    } catch (err) {
        Logger.error(err);
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, err);
    }
}

exports.afterPOST = afterPOST;
