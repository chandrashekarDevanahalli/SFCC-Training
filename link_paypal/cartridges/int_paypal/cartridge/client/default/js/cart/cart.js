/* eslint-disable no-nested-ternary */
import initPaypalButton from './initPaypalButton';
import initPaypalBAButton from './registered/initPaypalBAButton';
import { updateOrderData, returnFromCart } from '../api';

var $paypalImage = document.querySelector('#paypal_image') || document.querySelector('#venmo_image');
var $cartButton = document.querySelector('.js_paypal_button_on_cart_page');
var $isBAEnabled = $cartButton && JSON.parse($cartButton.getAttribute('data-paypal-ba-enabled'));
const paypalUrls = document.querySelector('.js_paypal-content').getAttribute('data-paypal-urls');
window.paypalUrls = JSON.parse(paypalUrls);

/**
 * Injects SDK into page for cart/minicart
*/
function injectPaypalSDK() {
    var head = document.getElementsByTagName('head').item(0);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () {
        $isBAEnabled ?
            initPaypalBAButton() :
            initPaypalButton();
    };
    script.src = window.paypalUrls.cartSdkUrl;
    script.setAttribute('data-partner-attribution-id', window.paypalUrls.partnerAttributionId);
    head.appendChild(script);
}

if ($paypalImage) {
    var isUpdateRequired = JSON.parse($paypalImage.getAttribute('data-is-update-required'));
    $paypalImage.addEventListener('click', isUpdateRequired ? updateOrderData : returnFromCart);
} else {
    // We do not inject SDK if SDK is already injected and window.paypal exists to avoid PayPal components destroying
    if (window.paypal && $isBAEnabled) {
        initPaypalBAButton();
    } else if (window.paypal) {
        initPaypalButton();
    }
    if (!window.paypal) {
        injectPaypalSDK();
    }
}

