'use strict';

/* global dw */
const OrderMgr = require('dw/order/OrderMgr');

const {
    paypalPaymentMethodId
} = require('*/cartridge/config/paypalPreferences');

const {
    createErrorLog
} = require('*/cartridge/scripts/paypal/paypalUtils');
const {
    handle,
    authorize
} = require('*/cartridge/scripts/paypal/processor');

/**
 * ProcessForm point for setting data
 * @param {Object} req current request
 * @param {Object} paymentForm payment form from hook
 * @param {Object} viewData data from hook
 * @returns {Object} viewData with required data
 */
function processForm(req, paymentForm, viewData) {
    paymentForm.paymentMethod = {
        value: paypalPaymentMethodId,
        htmlName: paypalPaymentMethodId
    };
    viewData.paymentMethod = {
        value: paypalPaymentMethodId,
        htmlName: paypalPaymentMethodId
    };
    viewData.paymentInformation = {
        billingForm: paymentForm
    };

    return {
        viewData: viewData
    };
}

/**
 * Handle entry point
 * @param {Object} basket Basket
 * @param {Object} billingForm - paymentForm from hook
 * @returns {Object} processor result
 */
function Handle(basket, billingForm) {
    return handle(basket, billingForm);
}

/**
 * Authorize entry point
 * @param {Object} orderNumber order numebr
 * @param {Object} paymentInstrument payment intrument
 * @returns {Object} processor result
 */
function Authorize(orderNumber, paymentInstrument) {
    var order = OrderMgr.getOrder(orderNumber);

    return authorize(order, paymentInstrument);
}

/**
 * createOrderNo entry point for setting or creating order number
 * @returns {string} order number
 */
function createOrderNo() {
    var orderNo = session.privacy.paypalUsedOrderNo;
    var isOrderExist;
    if (!orderNo) {
        orderNo = OrderMgr.createOrderSequenceNo();
        session.privacy.paypalUsedOrderNo = orderNo;
    } else {
        try {
            isOrderExist = !empty(OrderMgr.getOrder(orderNo));
            if (isOrderExist) {
                orderNo = OrderMgr.createOrderSequenceNo();
                session.privacy.paypalUsedOrderNo = orderNo;
            }
        } catch (error) {
            createErrorLog(error);
            orderNo = OrderMgr.createOrderSequenceNo();
            session.privacy.paypalUsedOrderNo = orderNo;
        }
    }
    return orderNo;
}

exports.processForm = processForm;
exports.Handle = Handle;
exports.Authorize = Authorize;
exports.createOrderNo = createOrderNo;
