import paypalConstants from '../../../scripts/util/paypalConstants';

const defaultStyle = {
    color: 'gold',
    shape: 'rect',
    layout: 'vertical',
    label: 'paypal',
    tagline: false
};

/**
 *  Gets paypal button styles
 * @param {Element} button - button element
 * @returns {Object} with button styles or if error appears with default styles
 */
function getPaypalButtonStyle(button) {
    try {
        const config = button.getAttribute('data-paypal-button-config');
        if (config) {
            const buttonConfigs = JSON.parse(config);
            return buttonConfigs.style;
        }

        return {
            style: defaultStyle
        };
    } catch (error) {
        return {
            style: defaultStyle
        };
    }
}

/**
 * Creates a redirecting form to Order-Confirm endpoint
 * @param {Object} param  The helping object for creating a from
 * @returns {Object} form element
 */
function createConfirmForm(param) {
    const form = $('<form>')
        .appendTo(document.body)
        .attr({
            method: 'POST',
            action: param.url
        });

    $('<input>')
        .appendTo(form)
        .attr({
            name: 'orderID',
            value: param.orderID
        });

    $('<input>')
        .appendTo(form)
        .attr({
            name: 'orderToken',
            value: param.orderToken
        });

    return form;
}

/**
 * Prepare and submits form in order to confirm order with Lpm
 * @param {string} redirectUrl Redirect Url
 */
function processLpmConfirmForm(redirectUrl) {
    const splitUrl = redirectUrl.split('?');
    const url = splitUrl[0];
    const paramsString = splitUrl[1];
    const searchParams = new URLSearchParams(paramsString);
    const formParam = {
        orderID: searchParams.get('orderID'),
        orderToken: searchParams.get('orderToken'),
        url: url
    };
    const form = createConfirmForm(formParam);

    form.submit();
}

/**
 * Return payment method name in lovercase
 * @param {string} paymentMethodName Payment method name
 * @returns {string} Paymnet method name
 */
function getPaymentMethodToLowerCase(paymentMethodName) {
    const paymentMethod = paymentMethodName.split('_');
    if (paymentMethod.length === 1) {
        return paymentMethodName;
    }
    paymentMethod.forEach(function (element, index) {
        paymentMethod[index] = element.charAt(0) + element.slice(1).toLocaleLowerCase();
    });

    return paymentMethod[1] ? [paymentMethod[0], paymentMethod[1]].join(' ') : paymentMethod[0];
}

/**
 * Updates html div view
 * @param {Object} order Order object
 * @param {string} html Html string
 * @returns {string} html Updated html string
 */
function appendHtml(order, html) {
    const payment = order.billing.payment;

    payment.selectedPaymentInstruments.forEach(function (selectedPaymentInstrument) {
        const paymnetMethodId = selectedPaymentInstrument.paymentMethod;
        const fundingSource = selectedPaymentInstrument.fundingSource;

        if (fundingSource === paypalConstants.PP_DEBIT_CREDIT_PAYMENT_TYPE) {
            html += ['<div>', paypalConstants.PP_DEBIT_CREDIT_PAYMENT_TYPE, '</div>'].join('');
        } else if (fundingSource === paypalConstants.PAYMENT_METHOD_ID_VENMO) {
            html += ['<div>', paypalConstants.PAYMENT_METHOD_ID_VENMO, '</div>'].join('');
        } else {
            html += ['<div>', getPaymentMethodToLowerCase(paymnetMethodId), '</div>'].join('');
        }

        if (paymnetMethodId !== paypalConstants.PAYMENT_METHOD_ID_PAYPAL && selectedPaymentInstrument.maskedCreditCardNumber) {
            html += ['<div>', selectedPaymentInstrument.maskedCreditCardNumber, '</div>'].join('');
        }

        if (paymnetMethodId === paypalConstants.PAYMENT_METHOD_ID_PAYPAL) {
            html += ['<div>', selectedPaymentInstrument.paypalEmail, '</div>'].join('');
        }

        if (selectedPaymentInstrument.type) {
            html += ['<div>', selectedPaymentInstrument.type, '</div>'].join('');
        }
        html += ['<div>', order.priceTotal.charAt(0), selectedPaymentInstrument.amount, '</div>'].join('');
    });
    return html;
}

/**
 * Updates checkout view
 * @param {Object} e Event object
 * @param {Object} data Data object
 */
function updateCheckoutView(e, data) {
    const $paymentSummary = document.querySelector('.summary-details .payment-details');
    const order = data.order;
    const payment = order.billing.payment;
    let htmlToAppend = '';

    if (payment && payment.selectedPaymentInstruments && payment.selectedPaymentInstruments.length > 0) {
        htmlToAppend += appendHtml(order, htmlToAppend);
    }

    if ($paymentSummary) {
        $paymentSummary.innerHTML = htmlToAppend;
    }
}

/**
 * Shows error on the 'AutomaticPmAdding' page
 * @param {string} errorTest An error text
 */
function showAutomatcPmAddingError(errorTest) {
    var $errorContaner = $('.automatic-payment-adding_error');
    $errorContaner.append(errorTest);
}

export {
    getPaypalButtonStyle,
    processLpmConfirmForm,
    updateCheckoutView,
    showAutomatcPmAddingError
};
