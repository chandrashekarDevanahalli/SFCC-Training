'use strict';

/**
 * Compare form billing agreement email with saved billing agreement email under paypal Payment Instrument
 *
 * @param {string} activeBA - current saved paypal Payment Instrument ba
 * @param {Object} formBA - current customer  ba billingForm
 * @returns {boolean} true or false
 */
function isSameBillingAgreement(activeBA, formBA) {
    return activeBA.email === formBA.email &&
        activeBA.default === formBA.default &&
        activeBA.saveToProfile === formBA.saveToProfile;
}

/**
 * Get customer payment instrumrent object using current payment instrument billing token
 *
 * @param {string} paymentInstrumentBillingToken - current payment instrument billing token
 * @returns {Object} customer payment instrument object
 */
function getPaymentInstrumentByBAToken(paymentInstrumentBillingToken) {
    return customer.profile.wallet.paymentInstruments.toArray().find(function (pi) {
        return pi.custom.paypalBillingAgreementToken === paymentInstrumentBillingToken;
    });
}

/**
 * Get customer payment instrumrent object using current payment instrument billing email
 * @param {string} paymentInstrumentBAEmail - current payment instrument billing email
 * @returns {Object} customer payment instrument object
 */
function getPaymentInstrumentByBAEmail(paymentInstrumentBAEmail) {
    return customer.profile.wallet.paymentInstruments.toArray().find(function (pi) {
        return pi.custom.paypalBillingAgreementEmail === paymentInstrumentBAEmail;
    });
}

/**
* Save payment instrument related to billing agreement flow
* @param {dw.order.Basket} basket Current basket
* @param {dw.order.PaymentInstrument} paymentInstrument Current payment instrument of basket
 */
function createCustomerPaymentInstrument(basket, paymentInstrument) {
    let baData = JSON.parse(paymentInstrument.custom.PP_API_ActiveBillingAgreement);
    const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
    const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
    const billingAgreementInstance = new BillingAgreementModel();

    if (baData && baData.baID && baData.email) {
        const savedBA = billingAgreementInstance.getActiveBillingAgreements();

        if (empty(savedBA)) {
            baData.default = true;
        }

        baData.saveToProfile = true;
    }

    let currentPaymentInstrument = getPaymentInstrumentByBAEmail(paymentInstrument.custom.currentPaypalEmail);

    if (empty(currentPaymentInstrument)) {
        currentPaymentInstrument = basket.getCustomer().getProfile().getWallet().createPaymentInstrument(paypalConstants.PAYMENT_METHOD_ID_PAYPAL);
    }

    billingAgreementInstance.addBillingAgreement(baData);
    // Update the list of active billing agreements
    const newBillingAgreementList = billingAgreementInstance.getActiveBillingAgreements();

    customer.profile.custom.PP_API_billingAgreement = JSON.stringify(newBillingAgreementList);
    // Add additional custom properties to customer payment instrument
    currentPaymentInstrument.custom.paypalBillingAgreementEmail = baData.email;
    currentPaymentInstrument.custom.paypalBillingAgreementID = baData.baID;
}

/**
 * Get customer payment instrumrent object using current payment instrument billing token
 *
 * @param {string} paymentInstrumentBillingAgreementID - current payment instrument billing agreement ID
 * @returns {Object} customer payment instrument object
 */
function getPaymentInstrumentByBillingAgreementID(paymentInstrumentBillingAgreementID) {
    return customer.profile.wallet.paymentInstruments.toArray().find(function (pi) {
        return pi.custom.paypalBillingAgreementID === paymentInstrumentBillingAgreementID;
    });
}


/**
 * Get customer payment instrumrent object using current payment instrument billing token
 *
 * @param {Object} paymentInstruments - current customer payment instrument list
 * @param {string} paymentInstrumentUUID - current payment instrument billing token
 * @returns {Object} customer payment instrument object
 */
function getPaymentInstrumentByUUID(paymentInstruments, paymentInstrumentUUID) {
    return paymentInstruments.toArray().find(function (pi) {
        return pi.UUID === paymentInstrumentUUID;
    });
}

/**
 * Get true in a case when payment instrument with PayPal Billing Agreement Email already exist
 *
 * @param {string} paymentInstrumentBillingEmail - current payment instrument billing agreement email
 * @returns {boolean} true / false
 */
function billingAgreementExist(paymentInstrumentBillingEmail) {
    return customer.profile.wallet.paymentInstruments.toArray().some(function (pi) {
        return pi.custom.paypalBillingAgreementEmail === paymentInstrumentBillingEmail;
    });
}

module.exports = {
    isSameBillingAgreement: isSameBillingAgreement,
    billingAgreementExist: billingAgreementExist,
    getPaymentInstrumentByBAToken: getPaymentInstrumentByBAToken,
    getPaymentInstrumentByUUID: getPaymentInstrumentByUUID,
    getPaymentInstrumentByBillingAgreementID: getPaymentInstrumentByBillingAgreementID,
    createCustomerPaymentInstrument: createCustomerPaymentInstrument
};
