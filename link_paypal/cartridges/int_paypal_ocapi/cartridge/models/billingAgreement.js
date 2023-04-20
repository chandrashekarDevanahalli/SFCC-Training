'use strict';

const PaypalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const PaypalApi = require('*/cartridge/scripts/paypal/paypalApi');
const BillingAgreementHelper = require('*/cartridge/scripts/paypal/helpers/billingAgreementHelper');

const BillingAgreementLimit = 3;

/**
 * Deprecated method, must to be modify.
 * Check if billing agreements from customers profile is active
 * @param  {string} billingAgreementID Billing agreement id to check
 * @returns {boolean} true or false
 */
function checkBillingAgreementStatus(billingAgreementID) {
    var baID = JSON.stringify({
        baID: billingAgreementID
    });
    var paymentInstrumentMock = {
        custom: {
            PP_API_ActiveBillingAgreement: baID
        }
    };
    var {
        active
    } = PaypalApi.getBADetails(paymentInstrumentMock);

    return active;
}

/**
 * Deprecated, must to be modify
 * BA model
 */
function BillingAgreementModel() {
    var savedBillingAgreements;

    try {
        var savedAccounts = customer.profile.custom.PP_API_billingAgreement;

        if (!empty(savedAccounts)) {
            savedBillingAgreements = JSON.parse(savedAccounts);
        }
    } catch (error) {
        PaypalUtils.createErrorLog(error);
    }

    this.billingAgreements = !empty(savedBillingAgreements) ? savedBillingAgreements : [];
}

/**
 * Return billing agreement from customers profile
 * @param  {boolean} checkStatus Check billing agreement active status before return billing agreements
 * @returns {Array} Saved billing agreements
 */
BillingAgreementModel.prototype.getBillingAgreements = function (checkStatus) {
    if (checkStatus) {
        this.checkBillingAgreementsStatus();
    }

    return this.billingAgreements;
};

/**
 * Return billing agreement from customers profile
 * @param  {boolean} checkStatus Check billing agreement active status before return billing agreements
 * @returns {Array} Saved billing agreements
 */
BillingAgreementModel.prototype.getActiveBillingAgreements = function () {
    this.checkBillingAgreementsStatus();

    return this.billingAgreements;
};

/**
 * Add new billing agreements to billing agreement list
 * @param  {Object} usedBillingAgreement Billing agreement to add
 */
BillingAgreementModel.prototype.addBillingAgreement = function (usedBillingAgreement) {
    if (this.isBaLimitReached()) {
        return;
    }

    if (usedBillingAgreement.saveToProfile) {
        delete usedBillingAgreement.saveToProfile;
        this.billingAgreements.push(usedBillingAgreement);
    }

    if (usedBillingAgreement.default) {
        this.changeDefaultBillingAgreement(usedBillingAgreement);
    }
};

/**
 * Change default billing agreement in customers profile
 * @param  {Object} usedBillingAgreement New default billing agreement
 */
BillingAgreementModel.prototype.changeDefaultBillingAgreement = function (usedBillingAgreement) {
    this.billingAgreements.forEach(function (billingAgreement) {
        billingAgreement.default = billingAgreement.baID === usedBillingAgreement.baID;
    });
};

/**
 * Get default billing agreement in profile
 * @returns {Object} Default billing agreement
 */
BillingAgreementModel.prototype.getDefaultBillingAgreement = function () {
    var defaultBa;

    this.billingAgreements.forEach(function (billingAgreement) {
        if (billingAgreement.default) {
            defaultBa = billingAgreement;
        }
    });

    return defaultBa;
};

/**
 * Check if customer reached allowed number of billing agreements
 * @returns {boolean} Is limit reached
 */
BillingAgreementModel.prototype.isBaLimitReached = function () {
    return this.billingAgreements.length === BillingAgreementLimit;
};

/**
 * Get billing agreement from profile by email
 * @param  {string} email Email to look
 * @returns {Object} Billing agreements
 */
BillingAgreementModel.prototype.getBillingAgreementByEmail = function (email) {
    return this.billingAgreements.filter(function (billingAgreement) {
        return billingAgreement.email === email;
    })[0];
};

/**
 * Check if email already exist in billing agreements list
 * @param  {string} email Email to look
 * @returns {boolean} Billing agreement status
 */
BillingAgreementModel.prototype.isAccountAlreadyExist = function (email) {
    return this.billingAgreements.some(function (billingAgreement) {
        return billingAgreement.email === email;
    });
};

/**
 * Deprecated method, must to be modify
 * Remove billing agreement from customers profile, update default value
 * @param  {Object} ba Billing agreement to remove
 */
BillingAgreementModel.prototype.removeBillingAgreement = function (ba) {
    if (empty(this.billingAgreements)) {
        return;
    }

    var isBADefault = ba.default;
    var removedBAindex = this.billingAgreements
        .map(function (billingAgreement) {
            return billingAgreement.baID;
        })
        .indexOf(ba.baID);

    this.billingAgreements.splice(removedBAindex, 1);

    if (!empty(this.billingAgreements) && isBADefault) {
        this.billingAgreements[0].default = true;
    }
};

/**
 * Deprecated method, must to be modify
 * Remove inactive billing agreement from customer's profile
 * @returns {void}
 */
BillingAgreementModel.prototype.checkBillingAgreementsStatus = function () {
    var that = this;

    that.billingAgreements.forEach(function (ba) {
        var isBillingAgreementActive = checkBillingAgreementStatus(ba.baID);

        if (!isBillingAgreementActive) {
            that.removeBillingAgreement(ba);
            var paymentInstrumentToDelete = BillingAgreementHelper.getPaymentInstrumentByBillingAgreementID(ba.baID);

            if (paymentInstrumentToDelete) {
                customer.getProfile().getWallet().removePaymentInstrument(paymentInstrumentToDelete);
            }
        }
    });
};

module.exports = BillingAgreementModel;
