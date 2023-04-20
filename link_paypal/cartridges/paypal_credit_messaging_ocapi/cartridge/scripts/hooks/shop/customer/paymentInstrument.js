'use strict';

const Resource = require('dw/web/Resource');

const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
const paypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const billingAgreementHelper = require('*/cartridge/scripts/paypal/helpers/billingAgreementHelper');
const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
const BillingAgreementModel = require('*/cartridge/models/billingAgreement');

// Hook dw.ocapi.shop.customer.payment_instrument.beforePOST functionality

/**
 * The hook that performs validation of billing agreement adding
 * @param {dw.customer.Customer} _ the object which can represent the current customer
 * @param {Object} paymentInstrument the object which represents the current request
 * @returns {Status} returns an error object in a case of mistake
**/
function beforePOST(_, paymentInstrument) {
    try {
        if (!empty(paymentInstrument.paymentMethodId) && paymentInstrument.paymentMethodId === paypalConstants.PAYMENT_METHOD_TYPE) {
            const billingAgreementInstance = new BillingAgreementModel();

            if (billingAgreementInstance.isBaLimitReached()) {
                throw new Error(Resource.msg('paypal.billing.agreement.limit.reached.error', 'paypalerrors', null));
            }

            if (empty(paymentInstrument.c_paypalBillingAgreementToken)) {
                throw new Error(Resource.msg('paypal.add.billing.agreement.c_paypalBillingAgreementToken.error', 'paypalerrors', null));
            }

            const newBillingAgreement = paypalApi.createBillingAgreement(paymentInstrument.c_paypalBillingAgreementToken);

            if (billingAgreementHelper.billingAgreementExist(newBillingAgreement.payer.payer_info.email)) {
                throw new Error(Resource.msg('paypal.billing.agreement.already.exist.error', 'paypalerrors', null));
            }
        }
    } catch (error) {
        return hooksHelper.createErrorStatus(error);
    }
}

// Hook dw.ocapi.shop.customer.payment_instrument.afterPOST functionality

/**
 * The hook that performs the adding of billing agreement
 * @param {dw.customer.Customer} customer the object which represents the current customer
 * @param {Object} paymentInstrument the object which represents the current request
 * @returns {Status} returns an error object in a case of mistake
**/
function afterPOST(customer, paymentInstrument) {
    try {
        if (!empty(paymentInstrument.paymentMethodId) && paymentInstrument.paymentMethodId === paypalConstants.PAYMENT_METHOD_TYPE) {
            const baToken = paymentInstrument.c_paypalBillingAgreementToken;
            const billingAgreementInstance = new BillingAgreementModel();
            const newBillingAgreement = paypalApi.createBillingAgreement(baToken);

            let baData = {
                baID: newBillingAgreement.id,
                email: newBillingAgreement.payer.payer_info.email
            };

            if (baData) {
                const savedBA = billingAgreementInstance.getActiveBillingAgreements();

                if (empty(savedBA)) {
                    baData.default = true;
                }

                baData.saveToProfile = true;
            }

            const isAccountAlreadyExist = billingAgreementInstance.isAccountAlreadyExist(baData.email);

            if (isAccountAlreadyExist) {
                throw new Error(Resource.msgf('paypal.billing.agreement.with.this.token.does.not.exist.error', 'paypalerrors', null, baToken));
            }

            billingAgreementInstance.addBillingAgreement(baData);
            // Update the list of active billing agreements
            const newBillingAgreementList = billingAgreementInstance.getActiveBillingAgreements();

            customer.profile.custom.PP_API_billingAgreement = JSON.stringify(newBillingAgreementList);
            // Add additional custom properties to customer payment instrument
            let currentPaymentInstrument = billingAgreementHelper.getPaymentInstrumentByBAToken(baToken);
            currentPaymentInstrument.custom.paypalBillingAgreementEmail = baData.email;
            currentPaymentInstrument.custom.paypalBillingAgreementID = baData.baID;
        }
    } catch (error) {
        return hooksHelper.createErrorStatus(error);
    }
}

// Hook dw.ocapi.shop.customer.payment_instrument.beforeDELETE functionality

/**
 * The hook that performs the removal of a payment instrument on the PayPal side
 * @param {dw.customer.Customer} customer the object which represents the current customer
 * @param {string} UUID the string which represents the current payment instrument
 * @returns {Object} returns an error object if there are no payment instruments in customer' wallet or an incorrect UUID is used
**/
function beforeDELETE(customer, UUID) {
    try {
        const paymentInstruments = customer.getProfile().getWallet().getPaymentInstruments();

        if (paymentInstruments.empty) {
            throw Resource.msg('paypal.no.payment.instrument.to.delete.error', 'paypalerrors', null);
        }

        const currentPaymentInstrument = billingAgreementHelper.getPaymentInstrumentByUUID(paymentInstruments, UUID);

        if (empty(currentPaymentInstrument)) {
            throw Resource.msgf('paypal.no.payment.instrument.with.current.UUID.error', 'paypalerrors', null, UUID);
        }

        const billingAgreementInstance = new BillingAgreementModel();
        const baEmail = currentPaymentInstrument.custom.paypalBillingAgreementEmail;
        const billingAgreement = billingAgreementInstance.getBillingAgreementByEmail(baEmail);
        billingAgreementInstance.removeBillingAgreement(billingAgreement);
        // Cancel billing agreements on PP side
        paypalApi.cancelBillingAgreement(billingAgreement.baID);
        // Update the list of active billing agreements
        const newBillingAgreementList = billingAgreementInstance.getActiveBillingAgreements();
        customer.profile.custom.PP_API_billingAgreement = JSON.stringify(newBillingAgreementList);
    } catch (error) {
        return hooksHelper.createErrorStatus(error);
    }
}

exports.beforePOST = beforePOST;
exports.afterPOST = afterPOST;
exports.beforeDELETE = beforeDELETE;
