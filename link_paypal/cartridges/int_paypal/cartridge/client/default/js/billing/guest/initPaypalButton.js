/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */
const { getPurchaseUnits, showCheckoutErrorHtml, finishLpmOrder } = require('../../api');
const { isLpmUsed } = require('../billingHelper');
const { getPaypalButtonStyle, processLpmConfirmForm } = require('../../helper');
const paypalConstants = require('../../../../../scripts/util/paypalConstants');

const loaderInstance = require('../../loader');
const $loaderContainer = document.querySelector('.paypalLoader');
const loader = loaderInstance($loaderContainer);
const $usedPaymentMethod = document.querySelector('#usedPaymentMethod');
const regExpPhone = new RegExp(paypalConstants.REGEXP_PHONE);
const regExpEmail = new RegExp(paypalConstants.REGEXP_EMAIL);
const notEmptyString = new RegExp(paypalConstants.REGEXP_NOT_EMPTY_STRING);

/**
 *  Filters valid form elements
 *
 * @param {string} str - arg
 * @returns {string} with valid form element
 */
function filterValidFormElement(str) {
    return (str.indexOf('addressFields') !== -1 || str.indexOf('contactInfoFields') !== -1)
        && notEmptyString.test(str);
}

/**
 *  Parses billing fields
 *
 * @param {string} acc -
 * @param {string} str - paypal actions
 * @returns {string} decoded string
 */
function parseBillingFields(acc, str) {
    let [key, value] = str.split('=');
    key = key.split('_');
    key = key[key.length - 1];
    const inputValue = decodeURIComponent(value);

    if (key === 'phone' || key === 'email') {
        const validInput = (key === 'phone') ?
            regExpPhone.test(inputValue) :
            regExpEmail.test(inputValue);
        if (!validInput) {
            return acc;
        }
    }

    acc[key] = inputValue;
    return acc;
}

/**
 *  Creates billing address, serializes address into form
 *
 * @returns {Object} with created billing address
 */
function createBillingAddress() {
    return $('#dwfrm_billing')
        .serialize()
        .split('&')
        .filter(filterValidFormElement)
        .reduce(parseBillingFields, {});
}

/**
 *  Creates payer object with billing address data
 *
 * @param {Object} billingAddress - billing address
 * @returns {Object} with payer data
 */
function createPayerObject(billingAddress) {
    if (billingAddress.country && billingAddress.phone) {
        return {
            name: {
                given_name: billingAddress.firstName,
                surname: billingAddress.lastName
            },
            email_address: billingAddress.email,
            phone: {
                phone_number: {
                    national_number: billingAddress.phone
                }
            },
            address: {
                address_line_1: billingAddress.address1,
                address_line_2: billingAddress.address2 || '',
                admin_area_2: billingAddress.city,
                admin_area_1: billingAddress.stateCode,
                postal_code: decodeURIComponent(billingAddress.postalCode),
                country_code: billingAddress.country
            }
        };
    }
    return false;
}

/**
 * Saves used payment method to hidden input
 *
 * @param {Object} data - object with data
 */
function onClick(data) {
    if (data.fundingSource === 'card') {
        $usedPaymentMethod.value = 'PayPal Debit/Credit Card';
    } else {
        $usedPaymentMethod.value = data.fundingSource;
    }
}
/**
 *  Gets purchase units object, creates order and returns object with data
 *
 * @param {Object} _ - arg
 * @param {Object} actions - paypal actions
 * @returns {Object} with purchase units, payer and application context
 */
function createOrder(_, actions) {
    loader.show();
    return getPurchaseUnits()
        .then(purchaseUnits => {
            const parsedPurchaseUnit = purchaseUnits[0];
            if (JSON.parse(parsedPurchaseUnit.amount.value) === 0) {
                showCheckoutErrorHtml('Order total 0 is not allowed for PayPal');
            }
            var payer;
            const payerObj = createPayerObject(createBillingAddress());
            if (payerObj) {
                payer = payerObj;
            }
            const APPLICATION_CONTEXT = {
                shipping_preference: parsedPurchaseUnit.shipping_preference
            };
            loader.hide();
            return actions.order.create({
                purchase_units: purchaseUnits,
                payer,
                application_context: APPLICATION_CONTEXT
            });
        });
}

/**
 * Sets orderID to hidden input, clears session account if it exists and irrelevant errors,
 * and clicks submit payment button
 *
 * @param {Object} data - object with data
 * @param {Object} actions - actions
 *
 */
function onApprove(data, actions) {
    loader.show();

    if (isLpmUsed($usedPaymentMethod)) {
        actions.order.capture()
            .then(finishLpmOrder)
            .then(({ redirectUrl }) => {
                loader.hide();
                processLpmConfirmForm(redirectUrl);
            })
            .catch(function () {
                loader.hide();
            });
        return;
    }

    var $orderId = document.querySelector('#paypal_orderId');
    var $selectedAccount = document.querySelector('#sessionPaypalAccount');

    if ($usedPaymentMethod.value === 'venmo') {
        $usedPaymentMethod.value = 'Venmo';
        document.querySelector('button.place-order').innerText = 'Place Order with Venmo';
    }

    $orderId.value = data.orderID;

    if ($selectedAccount.value !== '') {
        $selectedAccount.value = '';
        $selectedAccount.innerText = '';
    }

    $selectedAccount.selected = true;
    $selectedAccount.style.display = 'block';

    document.querySelector('button.submit-payment').click();
    loader.hide();
}

/**
 * Hides loader on paypal widget closing without errors
 *
 */
function onCancel() {
    loader.hide();
}

/**
 * Shows errors if paypal widget was closed with errors
 *
 */
function onError() {
    loader.hide();
    if (document.querySelector('.error-message').style.display !== 'block') {
        showCheckoutErrorHtml('An internal server error has occurred. \r\nRetry the request later.');
    }
}

/**
 *Inits paypal button on billing checkout page
 */
function initPaypalButton() {
    loader.show();
    window.paypal.Buttons({
        onClick,
        createOrder,
        onApprove,
        onCancel,
        onError,
        style: getPaypalButtonStyle(document.querySelector('.js_paypal_button_on_billing_form'))
    }).render('.paypal-checkout-button')
        .then(() => {
            loader.hide();
        });
}

module.exports = initPaypalButton;
