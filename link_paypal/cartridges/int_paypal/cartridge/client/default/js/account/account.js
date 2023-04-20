import initPaypalBAButton from './initPaypalBAButton';

const loaderInstance = require('../loader');
const $loaderContainer = document.querySelector('.paypalLoader');
const loader = loaderInstance($loaderContainer);

const $paypalAccountBtn = document.querySelector('.paypal-account-button');
const $addNewAccountBtn = document.querySelector('.add-paypal-account');
const $paypalBlock = document.querySelector('.paypal-block');
const $limitMsg = document.querySelector('.limitMsg');
const paypalUrls = $paypalAccountBtn && $paypalAccountBtn.getAttribute('data-paypal-urls');
window.paypalUrls = JSON.parse(paypalUrls);

if ($addNewAccountBtn && $paypalAccountBtn) {
    const isBaLimitReached = JSON.parse($paypalAccountBtn.getAttribute('data-paypal-is-ba-limit-reached'));

    $addNewAccountBtn.onclick = function () {
        if (window.paypal && $paypalAccountBtn.innerHTML === '' && !isBaLimitReached) {
            initPaypalBAButton();
        } else if (isBaLimitReached) {
            $limitMsg.style.display = 'block';
        }
    };
}

if ($paypalBlock) {
    $paypalBlock.onclick = function (e) {
        const target = e.target;

        if (target.classList.contains('remove-paypal-button')) {
            const baEmail = target.dataset.billingAgreementEmail;

            loader.show();

            return $.ajax({
                url: window.paypalUrls.removeBillingAgreement + `?billingAgreementEmail=${baEmail}`,
                type: 'DELETE'
            })
                .then(() => {
                    loader.hide();
                    location.reload();
                })
                .fail(() => {
                    loader.hide();
                });
        }
        return false;
    };
}
