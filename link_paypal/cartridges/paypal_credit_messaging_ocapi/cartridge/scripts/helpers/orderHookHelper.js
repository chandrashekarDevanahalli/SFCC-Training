'use strict';

/**
 * Create a request body object for createOrder call with BA
 * @param  {dw.order.OrderPaymentInstrument} paymentInstrument current active paypal payment instrument
 * @returns {Object} body for request
 */
function createBAReqBody(paymentInstrument) {
    const ActiveBillingAgreement = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement);
    const BillingAgreementId = ActiveBillingAgreement.baID;

    return {
        payment_source: {
            token: {
                id: BillingAgreementId,
                type: 'BILLING_AGREEMENT'
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
    const Payments = transactionResponse.purchase_units[0].payments;

    return Payments.captures ?
        Payments.captures[0].id :
        Payments.authorizations[0].id;
}

/**
 * Get transaction status from transaction response
 * @param  {Object} transactionResponse Response from call
 * @returns {string} Transaction status from response
 */
function getTransactionStatus(transactionResponse) {
    const Payments = transactionResponse.purchase_units[0].payments;
    let transactionStatus = Payments.captures ? Payments.captures[0].status : Payments.authorizations[0].status;

    if (Payments.authorizations && Payments.authorizations[0].status === 'CAPTURED' && !Payments.refunds) {
        transactionStatus = Payments.authorizations[0].status;
    }

    return transactionStatus;
}

module.exports = {
    createBAReqBody: createBAReqBody,
    getTransactionId: getTransactionId,
    getTransactionStatus: getTransactionStatus
};
