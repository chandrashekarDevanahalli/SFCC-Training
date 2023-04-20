'use strict';

// Helpers and tools
const PaypalPreferences = require('*/cartridge/config/paypalPreferences');
const PaymentInstrumentHelper = require('*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');
const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
const PayPalUtils = require('*/cartridge/scripts/paypal/paypalUtils');
const PayPalConstants = require('*/cartridge/scripts/util/paypalConstants');
const BillingAgreementInstance = new BillingAgreementModel();

const GetPaypalPaymentInstrument = PaymentInstrumentHelper.getPaypalPaymentInstrument;
const BillingAgreementEnabled = PaypalPreferences.billingAgreementEnabled;
const PartnerAttributionId = PaypalPreferences.partnerAttributionId;

let buttonConfigsHelper = {};

/**
 * Returns a general button configs object for pdp and carts pages
 * @param {dw.order.Basket} basket The current basket
 * @returns {Object} Confgis object
 */
function getGeneralExpressCheckoutBtnConfigs(basket) {
    const PaypalPaymentInstrument = basket && GetPaypalPaymentInstrument(basket) || null;

    let defaultBA = {};
    let showStaticImage = false;

    if (customer.authenticated && BillingAgreementEnabled) {
        const SavedPaypalBillingAgreements = BillingAgreementInstance.getBillingAgreements(true);

        if (!empty(SavedPaypalBillingAgreements)) {
            defaultBA = BillingAgreementInstance.getDefaultBillingAgreement();
            // for PDP page static image is shown only in case when user has saved paypal acounts
            showStaticImage = true;
        }
    }

    return {
        buttonConfigs: {
            partnerAttributionId: PartnerAttributionId,
            paypalButtonSdkUrl: PayPalUtils.createSDKUrl(),
            paypalEmail: PaypalPaymentInstrument && PaypalPaymentInstrument.custom.currentPaypalEmail,
            showStaticImage: showStaticImage,
            defaultBAemail: defaultBA.email,
            paypalStaticImageLink: PaypalPreferences.paypalStaticImageLink,
            billingAgreementEnabled: BillingAgreementEnabled
        },
        paypalPaymentInstrument: PaypalPaymentInstrument
    };
}

/**
 * Returns PayPal configs object for Product page
 * @param {dw.order.Basket} basket The current basket
 * @returns {Object} Confgis object
 */
buttonConfigsHelper.getPayPalConfigsForPdpPage = function (basket) {
    const GeneralButtonConfig = getGeneralExpressCheckoutBtnConfigs(basket);

    return Object.assign(GeneralButtonConfig.buttonConfigs, {
        buttonConfig: PaypalPreferences.paypalPdpButtonConfig
    });
};

/**
 * Returns PayPal configs object for Cart and Mini cart pages
 * @param {dw.order.Basket} basket The current basket
 * @param {string} pageId Current page id (cart or minicart)
 * @returns {Object} Confgis object
 */
buttonConfigsHelper.getPayPalConfigsForCartPages = function (basket, pageId) {
    const GeneralButtonConfig = getGeneralExpressCheckoutBtnConfigs(basket);
    const PaypalPaymentInstrument = GeneralButtonConfig.paypalPaymentInstrument;
    const IsPayPalPaymentInstrumentExist = PaypalPaymentInstrument !== null;
    const IsVenmoUsed = IsPayPalPaymentInstrumentExist && PaypalPaymentInstrument.custom.paymentId === PayPalConstants.PAYMENT_METHOD_ID_VENMO;

    return Object.assign(GeneralButtonConfig.buttonConfigs, {
        buttonConfig: pageId === PayPalConstants.PAGE_FLOW_CART ?
            PaypalPreferences.paypalCartButtonConfig :
            PaypalPreferences.paypalMinicartButtonConfig,
        isPaypalInstrumentExist: IsPayPalPaymentInstrumentExist && !empty(PaypalPaymentInstrument),
        isVenmoUsed: IsVenmoUsed
    });
};

/**
 * Returns PayPal configs object for Billing page
 * @param {dw.order.Basket} basket The current basket
 * @returns {Object} Confgis object
 */
buttonConfigsHelper.getPayPalConfigsForBillingPage = function (basket) {
    const Money = require('dw/value/Money');
    const StringUtils = require('dw/util/StringUtils');

    const PaypalPaymentInstrument = GetPaypalPaymentInstrument(basket);
    const Currency = basket.currencyCode;

    let paymentAmount = new Money(0, Currency);
    let paypalOrderID = '';
    let isBALimitReached;
    let hasDefaultPaymentMethod;
    let paypalEmail;
    let isAccountAlreadyExist = false;
    let activeBAEmail;
    let activeBAID;
    let isVenmoUsed = false;
    let savedPaypalBillingAgreements;

    if (customer.authenticated && BillingAgreementEnabled) {
        savedPaypalBillingAgreements = BillingAgreementInstance.getBillingAgreements(true);

        isBALimitReached = BillingAgreementInstance.isBaLimitReached();
        hasDefaultPaymentMethod = !empty(savedPaypalBillingAgreements);

        if (PaypalPaymentInstrument) {
            isAccountAlreadyExist = BillingAgreementInstance.isAccountAlreadyExist(PaypalPaymentInstrument.custom.currentPaypalEmail);
        }
    }

    if (PaypalPaymentInstrument) {
        if (!empty(PaypalPaymentInstrument.custom.PP_API_ActiveBillingAgreement)) {
            const ActiveBillingAgreement = JSON.parse(PaypalPaymentInstrument.custom.PP_API_ActiveBillingAgreement);

            activeBAEmail = ActiveBillingAgreement.email;
            activeBAID = ActiveBillingAgreement.baID;
            // Checkout from PDP/Minicart/Cart
            if (ActiveBillingAgreement.default && ActiveBillingAgreement.saveToProfile) {
                hasDefaultPaymentMethod = true;
            }
        }

        const Amount = PaypalPaymentInstrument.paymentTransaction.amount.value;

        paymentAmount = new Money(Amount, Currency);
        paypalEmail = PaypalPaymentInstrument.custom.currentPaypalEmail;
        isVenmoUsed = PaypalPaymentInstrument.custom.paymentId === PayPalConstants.PAYMENT_METHOD_ID_VENMO;

        if (PaypalPaymentInstrument.custom.paypalOrderID) {
            paypalOrderID = PaypalPaymentInstrument.custom.paypalOrderID;
        }
    }

    return {
        paymentAmount: StringUtils.formatMoney(paymentAmount),
        paypalEmail: paypalEmail,
        partnerAttributionId: PartnerAttributionId,
        buttonConfig: PaypalPreferences.paypalBillingButtonConfig,
        customerPaypalPaymentInstruments: savedPaypalBillingAgreements,
        hasDefaultPaymentMethod: hasDefaultPaymentMethod,
        paypalOrderID: paypalOrderID,
        isBALimitReached: isBALimitReached,
        payPalButtonSdkUrl: PayPalUtils.createBillingSDKUrl(),
        isAccountAlreadyExist: isAccountAlreadyExist,
        activeBAEmail: activeBAEmail,
        activeBAID: activeBAID,
        isVenmoUsed: isVenmoUsed
    };
};

/**
 * Returns a PayPal button configs object for current page
 * @param {dw.order.Basket} basket The current basket
 * @param {string} pageId The current page id
 * @returns {Object} The PayPal button configs object
 */
buttonConfigsHelper.getPayPalButtonConfigsForCurrentPage = function (basket, pageId) {
    let buttonConfigs;

    switch (pageId) {
        case PayPalConstants.PAGE_FLOW_PDP:
            buttonConfigs = buttonConfigsHelper.getPayPalConfigsForPdpPage(basket);
            break;
        case PayPalConstants.PAGE_FLOW_BILLING:
            buttonConfigs = buttonConfigsHelper.getPayPalConfigsForBillingPage(basket);
            break;
        // Cart and Mini cart flow
        default:
            buttonConfigs = buttonConfigsHelper.getPayPalConfigsForCartPages(basket, pageId);
            break;
    }

    return buttonConfigs;
};

module.exports = buttonConfigsHelper;
