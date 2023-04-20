/* eslint-disable no-nested-ternary */
import initPaypalButton from './initPaypalButton';
import initPaypalBAButton from './registered/initPaypalBAButton';
import { returnFromCart } from '../api';
import { addProductForPDPbtnFlow } from './pdpHelper';

const loaderInstance = require('../loader');
const $loaderContainer = document.querySelector('.paypalLoader');
const loader = loaderInstance($loaderContainer);

const $paypalPdpImage = document.querySelector('#paypal_pdp_image');
const $paypalPDPButton = document.querySelector('.js_paypal_button_on_pdp_page');
const $isBAEnabled = $paypalPDPButton && JSON.parse($paypalPDPButton.getAttribute('data-paypal-ba-enabled'));
const paypalUrls = document.querySelector('.js_paypal-content').getAttribute('data-paypal-urls');
window.paypalUrls = JSON.parse(paypalUrls);

if ($paypalPdpImage) {
    $paypalPdpImage.addEventListener('click', function () {
        loader.show();
        var res = addProductForPDPbtnFlow();
        if (res.cart) {
            returnFromCart();
        } else {
            loader.hide();
            throw new Error(res.message || 'Error occurs');
        }
    });
} else if (window.paypal) {
    $isBAEnabled ?
            initPaypalBAButton() :
            initPaypalButton();
}
