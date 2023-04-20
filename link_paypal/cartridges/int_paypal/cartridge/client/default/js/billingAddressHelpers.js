'use strict';

const HIDE_CLASS = 'none';

const $submitPayment = document.querySelector('.submit-payment');
const $billingAddressSelector = document.getElementById('billingAddressSelector');
const $addNewAddressButton = document.querySelector('.address-selector-block .btn-add-new');
const $billingAddressForm = document.querySelector('.billing-address-block .billing-address');
const $showAddressDetails = document.querySelector('.address-selector-block .btn-show-details');
const $contactInfoFieldPhone = document.querySelector('.dwfrm_billing_contactInfoFields_phone');

/** @returns {void} */
function hideBillingAddressManipulationButtons() {
    $showAddressDetails && $showAddressDetails.classList.add(HIDE_CLASS);
    $addNewAddressButton && $addNewAddressButton.classList.add(HIDE_CLASS);
}

/** @returns {void} */
function showBillingAddressManipulationButtons() {
    $showAddressDetails && $showAddressDetails.classList.remove(HIDE_CLASS);
    $addNewAddressButton && $addNewAddressButton.classList.remove(HIDE_CLASS);
}

/** @returns {void} */
function disableBillingAddressList() {
    $billingAddressSelector && $billingAddressSelector.setAttribute('disabled', 'disabled');
}

/** @returns {void} */
function enableBillingAddressList() {
    $billingAddressSelector && $billingAddressSelector.removeAttribute('disabled');
}

/** @returns {void} */
function hideSubmitPaymentButton() {
    $submitPayment && $submitPayment.classList.add(HIDE_CLASS);
}

/** @returns {void} */
function showSubmitPaymentButton() {
    $submitPayment && $submitPayment.classList.remove(HIDE_CLASS);
}

/**
 * Hides biiling address form on the Billing Page for appropriate tabs.
 * Case when customer clicked 'Updated address' or 'Add New' button and flipped through the payment method tabs
 * @returns {void}
 */
function hideBillingAddressForm() {
    $billingAddressForm && $billingAddressForm.classList.add(HIDE_CLASS);
}

/**
 * Shows biiling address form on the Billing Page for appropriate tabs.
 * Case when customer clicked 'Updated address' or 'Add New' button and flipped through the payment method tabs
 * @returns {void}
 */
function showBillingAddressForm() {
    $billingAddressForm && $billingAddressForm.classList.remove(HIDE_CLASS);
}

/**
 * Hides phone field on the Billing Page for appropriate tabs
 * @returns {void}
 */
function hidePhoneField() {
    $contactInfoFieldPhone && $contactInfoFieldPhone.classList.add(HIDE_CLASS);
}

/**
 * Shows phone field on the Billing Page for appropriate tabs
 * @returns {void}
 */
function showPhoneField() {
    $contactInfoFieldPhone && $contactInfoFieldPhone.classList.remove(HIDE_CLASS);
}

/**
 * Disabled billing address functionality on the Billing Page
 * @returns {void}
 */
function disableBillingAddressFunctionality() {
    disableBillingAddressList();
    hideBillingAddressManipulationButtons();
    hideBillingAddressForm();
    hidePhoneField();
}

/**
 * Enabled billing address functionality on the Billing Page
 * @returns {void}
 */
function enableBillingAddressFunctionality() {
    showBillingAddressManipulationButtons();
    enableBillingAddressList();
    showBillingAddressForm();
    showPhoneField();
}

module.exports = {
    disableBillingAddressFunctionality,
    enableBillingAddressFunctionality,
    hideBillingAddressManipulationButtons,
    showBillingAddressManipulationButtons,
    disableBillingAddressList,
    enableBillingAddressList,
    hideBillingAddressForm,
    showBillingAddressForm,
    hideSubmitPaymentButton,
    showSubmitPaymentButton,
    hidePhoneField,
    showPhoneField
};
