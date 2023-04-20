'use strict';

import { getBillingAgreementToken, createBillingAgreementCall, savePaypalDefaultAddress } from '../api';
import { showAutomatcPmAddingError } from '../helper';
import paypalConstants from '../../../../scripts/util/paypalConstants';

const $apmaButtonPayPal = document.querySelector('.js-apma-button-paypal');
const redirectUrl = $apmaButtonPayPal.getAttribute('data-redirect-url');
const isAccountPage = redirectUrl.toLowerCase().includes('account');
const paypalUrls = $apmaButtonPayPal.getAttribute('data-paypal-urls');
const addressObject = JSON.parse($apmaButtonPayPal.getAttribute('data-address-object'));
const addingStage = $apmaButtonPayPal.getAttribute('data-adding-stage');

window.paypalUrls = JSON.parse(paypalUrls);

/**
 *  Creates Billing Agreement
 *
 * @returns {string} returns JSON response that includes an data token
 */
function createBillingAgreement() {
    const isCartFlow = true;
    const isSkipShippingAddress = true;

    return getBillingAgreementToken(isCartFlow, isSkipShippingAddress)
        .then((data) => data.token)
        .fail(err => {
            showAutomatcPmAddingError(err.responseText);
        });
}

/**
 *  Makes post call using facilitator Access Token and transfers billingToken
 *  send baID & email to saveBillingAgreement endpoint
 *
 * @param {string} billingToken - billing agreement token
 * @returns {Object} JSON response that includes the billing agreement ID and information about the payer
 */
function onApprove({ billingToken }) {
    let ajaxResponse = createBillingAgreementCall(billingToken).then(({ id, payer }) => {
        const email = payer.payer_info.email;

        return $.ajax({
            url: window.paypalUrls.saveBillingAgreement,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ baID: id, email, isAutomaticPmAddingFlow: true })
        });
    });

    if (addingStage === paypalConstants.APMA_STAGE_COMPLETE) {
        ajaxResponse = ajaxResponse.then(() => {
            return savePaypalDefaultAddress(addressObject, isAccountPage);
        });
    }

    return ajaxResponse.then(() => {
        window.location.href = redirectUrl;
    });
}

if ($apmaButtonPayPal && window.paypal) {
    if (addingStage === paypalConstants.APMA_STAGE_ADDRESS) {
        $apmaButtonPayPal.classList.add('none');

        document.querySelector('.js-apma-button-yes').addEventListener('click', function () {
            savePaypalDefaultAddress(addressObject, isAccountPage).then(() => {
                window.location.href = redirectUrl;
            });
        });
    } else {
        window.paypal.Buttons({
            createBillingAgreement,
            onApprove
        }).render($apmaButtonPayPal);
    }
}
