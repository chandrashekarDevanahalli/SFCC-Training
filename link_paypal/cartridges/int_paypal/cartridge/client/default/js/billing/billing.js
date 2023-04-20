const initPaypalButton = require('./guest/initPaypalButton');
const initPaypalBAButton = require('./registered/initPaypalBAButton');

import { updateCheckoutView } from '../helper';

import {
    injectBillingSDK,
    handleTabChange,
    togglePaypalBtnVisibility,
    updateSessionAccountEmail,
    isNewAccountSelected,
    updateClientSide,
    updateSubmitOrderButton,
    shippingAddressFormFillingVerifing,
    isShippingAddressFormEmptyChecking
} from './billingHelper';

import {
    toggleBABtnVisibility,
    assignEmailForSavedBA,
    handleCheckboxChange
} from './registered/billingAgreementHelper';

let sdkLoaded = false;
const $restPaypalAccountsList = document.querySelector('#restPaypalAccountsList');
const isRegisteredUser = document.querySelector('.data-checkout-stage').getAttribute('data-customer-type') === 'registered';
const $billingButtonContainer = document.querySelector('#billing-paypal-button-container');
const isBAEnabled = $billingButtonContainer && JSON.parse($billingButtonContainer.getAttribute('data-is-ba-enabled'));
const paypalUrls = document.querySelector('.js_paypal-content').getAttribute('data-paypal-urls');

/**
 *
 * @param {Function} callbackToExecute - function that update curent type of information
 */
function addOnUpdateCheckoutViewListener(callbackToExecute) {
    $('body').on('checkout:updateCheckoutView', callbackToExecute);
}

window.paypalUrls = JSON.parse(paypalUrls);

$('.payment-options[role=tablist] a[data-toggle="tab"]').on('shown.bs.tab', handleTabChange);

if (window.paypal && !isBAEnabled) {
    sdkLoaded = true;
    initPaypalButton();
} else {
    if (window.paypal && isNewAccountSelected($restPaypalAccountsList) && isBAEnabled) {
        initPaypalBAButton();
        sdkLoaded = true;
    }

    const ppPaymentOptionID = document.querySelector('.nav-link.paypal-tab').parentElement.getAttribute('data-method-id');
    const activeTab = document.querySelector('.payment-information');

    document.querySelector('.nav-item .paypal-tab').click();

    if (ppPaymentOptionID !== activeTab.getAttribute('data-payment-method-id')) {
        activeTab.setAttribute('data-payment-method-id', ppPaymentOptionID);
        $('.payment-information').data('payment-method-id', ppPaymentOptionID); // MFRA jquery hack
    }

    if (!isBAEnabled) {
        togglePaypalBtnVisibility($restPaypalAccountsList);
    } else {
        toggleBABtnVisibility($restPaypalAccountsList);
        assignEmailForSavedBA();
    }
}

if ($restPaypalAccountsList) {
    $restPaypalAccountsList.onchange = function (e) {
        const $accountList = e ? e.target : $restPaypalAccountsList;
        if (!sdkLoaded && isNewAccountSelected($restPaypalAccountsList)) {
            injectBillingSDK();
            sdkLoaded = true;
        }

        if (!isBAEnabled) {
            togglePaypalBtnVisibility($accountList);
        } else {
            toggleBABtnVisibility($accountList);
            assignEmailForSavedBA();
        }
    };
}

if (!isRegisteredUser || !isBAEnabled) {
    addOnUpdateCheckoutViewListener(updateSessionAccountEmail);
}

addOnUpdateCheckoutViewListener(updateClientSide);

if (!isBAEnabled) {
    addOnUpdateCheckoutViewListener(updateSubmitOrderButton);

    updateSubmitOrderButton();

    document.querySelector('.payment-summary .edit-button').onclick = function () {
        document.querySelector('button.place-order').innerText = 'Place Order';
    };
}

addOnUpdateCheckoutViewListener(updateCheckoutView);

if (document.querySelector('.paypal-checkbox-container')) {
    document.querySelectorAll('.paypal-checkbox-container .custom-checkbox').forEach(checkbox => checkbox.addEventListener('change', handleCheckboxChange));
}
// This functionality checks that the shipping address form is filled out correctly
const isShippingAddressFormFillied = shippingAddressFormFillingVerifing();
const isShippingAddressFormEmpty = isShippingAddressFormEmptyChecking();
const $shippingEditButton = document.querySelector('.shipping-summary .edit-button');
const $shippingSubmitButton = document.querySelector('.submit-shipping');
const $shippingUpdateButton = document.querySelector('.shipping-address .shipment-selector-block .form-group .btn-show-details');

if (window.location.hash === '#placeOrder' && !isShippingAddressFormFillied && $shippingEditButton && $shippingSubmitButton) {
    $shippingEditButton.click();
    $shippingSubmitButton.click();
}

if (window.location.hash === '#shipping' && !isShippingAddressFormEmpty && !isShippingAddressFormFillied && $shippingUpdateButton && $shippingSubmitButton) {
    $shippingUpdateButton.click();
    $shippingSubmitButton.click();
}
