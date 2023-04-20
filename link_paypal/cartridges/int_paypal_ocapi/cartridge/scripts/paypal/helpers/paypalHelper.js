'use strict';

const BasketMgr = require('dw/order/BasketMgr');
const CustomObjectMgr = require('dw/object/CustomObjectMgr');
const OrderMgr = require('dw/order/OrderMgr');

const {
    paypalButtonLocation,
    billingAgreementDescription,
    enabledLPMsArray
} = require('*/cartridge/config/paypalPreferences');

const {
    getBAShippingAddress
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');

const {
    calculateNonGiftCertificateAmount
} = require('*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');

const {
    createShippingAddress
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');
const payPalConstants = require('*/cartridge/scripts/util/paypalConstants');

/**
 * Returns whether basket has only giftCertificates
 * @param {dw.order.Basket} currentBasket - user's basket
 * @returns {boolean}  true or false
 */
function hasOnlyGiftCertificates(currentBasket) {
    return currentBasket && currentBasket.giftCertificateLineItems.length > 0 && currentBasket.productLineItems.length === 0;
}

/**
 * Deprecated method, must to be modify.
 * Returns needed REST API data for Create a billing agreement token requst
 *
 * @param {boolean} isBillingPage - is billing agreement flow from Billing page
 * @param {dw.order.Basket} basket The current basket
 * @returns {Object} with token creation request data
 */
function getBARestData(isBillingPage, basket) {
    var baTokenData = {
        path: 'v1/billing-agreements/agreement-tokens',
        method: 'POST',
        body: {
            description: billingAgreementDescription || '',
            payer: {
                payment_method: 'PAYPAL'
            },
            plan: {
                type: 'MERCHANT_INITIATED_BILLING_SINGLE_AGREEMENT',
                merchant_preferences: {
                    return_url: '1',
                    cancel_url: '2',
                    accepted_pymt_type: 'INSTANT',
                    skip_shipping_address: false,
                    immutable_shipping_address: isBillingPage
                }
            }
        }
    };

    const currentBasket = basket || BasketMgr.currentBasket;

    if (hasOnlyGiftCertificates(currentBasket)) {
        baTokenData.body.plan.merchant_preferences.skip_shipping_address = true;
    } else if (isBillingPage && currentBasket.defaultShipment && currentBasket.defaultShipment.getShippingAddress()) {
        var shippingAddress = currentBasket.getDefaultShipment().getShippingAddress();
        baTokenData.body.shipping_address = getBAShippingAddress(shippingAddress);
    }

    return baTokenData;
}

/**
 * Create URL for a call
 * @param  {dw.svc.ServiceCredential} credential current service credential
 * @param  {string} path REST action endpoint
 * @returns {string} url for a call
 */
function getUrlPath(credential, path) {
    let url = credential.URL;

    if (!url.match(/.+\/$/)) {
        url += '/';
    }

    url += path;

    return url;
}

/**
 * @param  {dw.value.Money} acc current basket order + product discount
 * @param  {dw.order.OrderPaymentInstrument} giftCertificate GC from the basket
 * @returns {dw.value.Money} Gift certificate cotal
 */
function getAppliedGiftCertificateTotal(acc, giftCertificate) {
    return acc.add(giftCertificate.paymentTransaction.amount);
}

/**
 * Create purchase unit description based on items in the basket
 * @param  {dw.order.ProductLineItem} productLineItems Items in the basket
 * @returns {string} item description
 */
function getItemsDescription(productLineItems) {
    if (productLineItems.length === 0) {
        return '';
    }
    return Array.map(productLineItems, function (productLineItem) {
        return productLineItem.productName;
    }).join(',').substring(0, 127);
}

/**
 * Create purchase unit description based on gifts in the basket
 * @param  {dw.order.LineItemCtnr} giftCertificateLineItems Items in the basket
 * @returns {string} gift description
 */
function getGiftCertificateDescription(giftCertificateLineItems) {
    if (giftCertificateLineItems.length === 0) {
        return '';
    }
    return Array.map(giftCertificateLineItems, function (giftCertLineItem) {
        return giftCertLineItem.lineItemText + ' for ' + giftCertLineItem.recipientEmail;
    }).join(',').substring(0, 127);
}

/**
 * Deprecated method, must to be modify.
 * Creates puchase unit data
 * PayPal amount should equal: item_total + tax_total + shipping + handling + insurance - shipping_discount - discount
 *
 * @param {dw.order.Basket|dw.order.Order} lineItemSubClass - user's basket or order
 * @param {boolean} isBillingPage Wheater the billing page flow
 * @returns {Object} with purchase unit data
 */
function getPurchaseUnit(lineItemSubClass, isBillingPage) {
    const Order = require('dw/order/Order');
    const TaxMgr = require('dw/order/TaxMgr');
    var {
        currencyCode,
        defaultShipment,
        productLineItems,
        shippingTotalPrice,
        adjustedShippingTotalPrice,
        merchandizeTotalPrice,
        adjustedMerchandizeTotalPrice,
        giftCertificateLineItems,
        giftCertificateTotalPrice,
        totalTax
    } = lineItemSubClass;
    var handling;
    var insurance;

    var nonShippingDiscount = Array.reduce(
        lineItemSubClass.giftCertificatePaymentInstruments,
        getAppliedGiftCertificateTotal,
        merchandizeTotalPrice.subtract(adjustedMerchandizeTotalPrice)
    );
    var description = getItemsDescription(productLineItems) + ' ' + getGiftCertificateDescription(giftCertificateLineItems);

    var purchaseUnit = {
        description: description.trim(),
        amount: {
            currency_code: currencyCode,
            value: calculateNonGiftCertificateAmount(lineItemSubClass).value.toString(),
            breakdown: {
                item_total: {
                    currency_code: currencyCode,
                    value: merchandizeTotalPrice.add(giftCertificateTotalPrice).value.toString()
                },
                shipping: {
                    currency_code: currencyCode,
                    value: shippingTotalPrice.value.toString()
                },
                tax_total: {
                    currency_code: currencyCode,
                    value: TaxMgr.getTaxationPolicy() === TaxMgr.TAX_POLICY_GROSS ? '0' : totalTax.value.toString()
                },
                handling: {
                    currency_code: currencyCode,
                    value: !empty(handling) ? handling : '0'
                },
                insurance: {
                    currency_code: currencyCode,
                    value: !empty(insurance) ? insurance : '0'
                },
                shipping_discount: {
                    currency_code: currencyCode,
                    value: shippingTotalPrice
                        .subtract(adjustedShippingTotalPrice)
                        .value.toString()
                },
                discount: {
                    currency_code: currencyCode,
                    value: nonShippingDiscount.value.toString()
                }
            }
        }
    };

    purchaseUnit.shipping_preference = 'GET_FROM_FILE';

    if (lineItemSubClass instanceof Order) {
        purchaseUnit.invoice_id = lineItemSubClass.orderNo;
    }

    if (isBillingPage && defaultShipment && defaultShipment.getShippingAddress()) {
        purchaseUnit.shipping = createShippingAddress(defaultShipment.getShippingAddress());
        purchaseUnit.shipping_preference = 'SET_PROVIDED_ADDRESS';
    }

    if (empty(productLineItems) && !empty(giftCertificateLineItems)) {
        purchaseUnit.shipping_preference = 'NO_SHIPPING';
    }

    return purchaseUnit;
}

/**
 * Check if Paypal button is enabled
 * @param {string} targetPage prefs value
 * @return {boolean} disabled or enabled
 */
function isPaypalButtonEnabled(targetPage) {
    const DisplayPages = paypalButtonLocation.toLowerCase();

    return DisplayPages === payPalConstants.PAGE_FLOW_BILLING || !targetPage ?
        false : DisplayPages.indexOf(targetPage) !== -1;
}

/**
 * Whether a payPal payment method is active
 * @returns {boolean} True/false
 */
function isPayPalPaymentMethodActive() {
    const PaymentMgr = require('dw/order/PaymentMgr');

    return PaymentMgr.activePaymentMethods.toArray().some(function (paymentMethod) {
        return paymentMethod.paymentProcessor.ID === payPalConstants.PROCESSOR_PAYPAL;
    });
}

/**
 * Returns whether the PayPal button is enabled on Product page
 * @returns {boolean} True/false
 */
function isPayPalBtnEnabledOnPdpPage() {
    return isPayPalPaymentMethodActive() && isPaypalButtonEnabled(payPalConstants.PAGE_FLOW_PDP);
}

/**
 * Returns whether the PayPal button is enabled on Cart page
 * @returns {boolean} True/false
 */
function isPayPalBtnEnabledOnCartPage() {
    return isPayPalPaymentMethodActive() && isPaypalButtonEnabled(payPalConstants.PAGE_FLOW_CART);
}

/**
 * Returns whether the PayPal button is enabled on Mini cart page
 * @returns {boolean} True/false
 */
function isPayPalBtnEnabledOnMiniCartPage() {
    return isPayPalPaymentMethodActive() && isPaypalButtonEnabled(payPalConstants.PAGE_FLOW_MINICART);
}

/**
 * Returns whether the PayPal button is enabled on current page
 * @param {string} pageId Current page id
 * @returns {boolean} True/False
 */
function isPayPalBtnEnabledOnCurrentPage(pageId) {
    const availablePages = [
        payPalConstants.PAGE_FLOW_PDP,
        payPalConstants.PAGE_FLOW_BILLING,
        payPalConstants.PAGE_FLOW_MINICART,
        payPalConstants.PAGE_FLOW_CART
    ];
    let isPayPalButtonEnabled = false;

    if (availablePages.indexOf(pageId) !== -1) {
        switch (pageId) {
            case payPalConstants.PAGE_FLOW_PDP:
                isPayPalButtonEnabled = isPayPalBtnEnabledOnPdpPage();
                break;
            case payPalConstants.PAGE_FLOW_CART:
                isPayPalButtonEnabled = isPayPalBtnEnabledOnCartPage();
                break;
            case payPalConstants.PAGE_FLOW_MINICART:
                isPayPalButtonEnabled = isPayPalBtnEnabledOnMiniCartPage();
                break;
            // Billing flow
            default:
                isPayPalButtonEnabled = isPayPalPaymentMethodActive();
                break;
        }
    }

    return isPayPalButtonEnabled;
}

/**
 * Returns whether LPM is used
 * @param {string} paymentMethodId The  Local payment method id
 * @returns {boolean} True/false
 */
function isLpmUsed(paymentMethodId) {
    if (!enabledLPMsArray.length) {
        return false;
    }

    return enabledLPMsArray.indexOf(paymentMethodId) !== -1;
}

/**
 * Returns an erray of possible PayPal payment methods
 * @returns {Array} An array of possible PayPal payment methods
 */
function getPossiblePayPalPaymentMethodArray() {
    return enabledLPMsArray.concat([
        payPalConstants.PAYMENT_METHOD_ID_PAYPAL,
        payPalConstants.PAYMENT_METHOD_ID_VENMO,
        payPalConstants.PAYMENT_METHOD_ID_DEBIT_CREDIT_CARD
    ]);
}

/**
 * Return an order or object of PayPalNewTransactions custom object
 * @param {*} orderNo Order number
 * @returns {dw.order.Order} Order instance
 */
function getOrderByOrderNo(orderNo) {
    return CustomObjectMgr.getCustomObject('PayPalNewTransactions', orderNo) || OrderMgr.queryOrder('orderNo = {0}', orderNo);
}

module.exports = {
    getBARestData: getBARestData,
    getUrlPath: getUrlPath,
    getPurchaseUnit: getPurchaseUnit,
    isPaypalButtonEnabled: isPaypalButtonEnabled,
    isPayPalBtnEnabledOnPdpPage: isPayPalBtnEnabledOnPdpPage,
    isPayPalBtnEnabledOnCurrentPage: isPayPalBtnEnabledOnCurrentPage,
    isLpmUsed: isLpmUsed,
    getPossiblePayPalPaymentMethodArray: getPossiblePayPalPaymentMethodArray,
    getOrderByOrderNo: getOrderByOrderNo
};
