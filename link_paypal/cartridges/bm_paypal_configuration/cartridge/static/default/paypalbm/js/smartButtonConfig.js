/**
 * Variables
 */
const $heightFormControlRange = document.querySelector('#height__formControlRange');
const $colorButton = document.querySelector('#color_button');
const $shapeButton = document.querySelector('#shape_button');
const $layoutButton = document.querySelector('#layout_button');
const $label = document.querySelector('#label');
const $taglineButton = document.querySelector('#tagline_button');
const $heightFormControlNumber = document.querySelector('#height__formControlNumber');
const $locationButton = document.querySelector('#location_button');
const $smartbuttonConfigForm = document.getElementById('smartbutton-config-form');
const DATA_SMART_STYLE_SELECTOR = 'data-smart-styles';
const PAYPAL_CART_BUTTON_CLASS_SELECTOR = '.paypal-cart-button';
/**
 *  Appends Alerts message
 *
 * Avaible alerts types:
 * primary,  secondary, success, danger, warning, info, alert, dark
 * @param {Object} alert Alerts and type messages
 */
function showAlerts(alert) {
    const alertDiv = document.querySelector('#smart-button-alert-message');
    alertDiv.innerHTML = `<h5>${alert.message}</h5>`;
    alertDiv.className = `alert alert-${alert.type} show`;
    window.scrollTo(0, 0);
}

/**
 *  Fades Alerts message
 */
function fadeAlerts() {
    const alertDiv = document.querySelector('#smart-button-alert-message');
    alertDiv.innerHTML = '';
    alertDiv.className = 'alert alert-success fade';
}

/**
 * Return style configurations for Pay Pal smart button
 * Available values:
 *  height: (number) from 25 to 55,
 *  color: (string) gold, blue, silver, black, white,
 *  shape: (string) pill, rect,
 *  layout: (string) horizontal, vertical,
 *  tagline: (boolean) true, false
 *
 * PLEASE NOTE: 'vertical' layout is not allowed for active tagline
 *
 * @returns {Object}  object with height, color, shape, layout, label, tagline configuration values in it
 */
function getSmartButtonStyleConfigs() {
    return {
        height: Math.floor($heightFormControlRange.value),
        color: $colorButton.value,
        shape: $shapeButton.value,
        layout: $layoutButton.value,
        label: $label.value,
        tagline: JSON.parse($taglineButton.value)
    };
}

/**
 * Update html option's with saved Pay Pal smart button  values from custom pref PP_API_Smart_Button_Styles
 *
 * @param {Object} savedSmartStyles object with height, color, shape, layout, label, tagline configs
 */
function updateValuesWithStyleConfigs(savedSmartStyles) {
    $heightFormControlNumber.value = savedSmartStyles.height;
    $heightFormControlRange.value = savedSmartStyles.height;
    $colorButton.value = savedSmartStyles.color;
    $shapeButton.value = savedSmartStyles.shape;
    $layoutButton.value = savedSmartStyles.layout;
    $label.value = savedSmartStyles.label;
    $taglineButton.value = savedSmartStyles.tagline;
    $locationButton.value = savedSmartStyles.location;
}
/**
 *Renders the Pay Pal smart button based on the received configuration object (styleConfiguration).
 * @param {Object} styleConfiguration object with color, height, label, layout, location, shape, tagline configs
 */
function renderPaypalButton(styleConfiguration) {
    if (!styleConfiguration) {
        styleConfiguration = getSmartButtonStyleConfigs();
        document.querySelector(PAYPAL_CART_BUTTON_CLASS_SELECTOR).innerHTML = '';
        fadeAlerts();
    }

    window.paypal.Buttons({
        onInit: (_, actions) => {
            return actions.disable();
        },
        createOrder: () => { },
        onApprove: () => { },
        onCancel: () => { },
        onError: () => { },
        style: styleConfiguration
    }).render(PAYPAL_CART_BUTTON_CLASS_SELECTOR);
}

document.addEventListener('DOMContentLoaded', function () {
    let pageType = 'billing';
    if (window.location.search.split('=')[0] === '?savedButtonStyle') {
        pageType = window.location.search.split('=')[1];
        window.history.replaceState(null, null, window.location.pathname);
    }

    var smartButtonConfig = JSON.parse(
        $smartbuttonConfigForm.getAttribute(DATA_SMART_STYLE_SELECTOR)
    )[pageType];
    smartButtonConfig.location = pageType;
    updateValuesWithStyleConfigs(smartButtonConfig);
    renderPaypalButton(smartButtonConfig);
});

$colorButton.addEventListener('change', () => renderPaypalButton());

$label.addEventListener('change', () => renderPaypalButton());

$heightFormControlRange.addEventListener('change', () => {
    var smartButtonStyleConfigs = getSmartButtonStyleConfigs();

    document.querySelector(PAYPAL_CART_BUTTON_CLASS_SELECTOR).innerHTML = '';
    fadeAlerts();

    $heightFormControlNumber.value = $heightFormControlRange.value;
    renderPaypalButton(smartButtonStyleConfigs);
});

$heightFormControlNumber.addEventListener('change', () => {
    fadeAlerts();
    $heightFormControlRange.value = $heightFormControlNumber.value;
    const event = document.createEvent('Event');
    event.initEvent('change', true, true);

    // Dispatch the event
    $heightFormControlRange.dispatchEvent(event);
});

$shapeButton.addEventListener('change', () => renderPaypalButton());

$layoutButton.addEventListener('change', () => {
    // vertical layout is not allowed for active tagline
    const isTaglineButton = JSON.parse($taglineButton.value);
    const isLayoutVertical = $layoutButton.value === 'vertical';
    var smartButtonStyleConfigs;

    document.querySelector(PAYPAL_CART_BUTTON_CLASS_SELECTOR).innerHTML = '';
    fadeAlerts();

    if (isTaglineButton && isLayoutVertical) {
        $taglineButton.value = false;
        showAlerts(window.resourcesAlertMessages.layout);
    }

    smartButtonStyleConfigs = getSmartButtonStyleConfigs();
    renderPaypalButton(smartButtonStyleConfigs);
});

$taglineButton.addEventListener('change', () => {
    // style.tagline is not allowed for vertical layout
    const isTaglineButton = JSON.parse($taglineButton.value);
    const isLayoutVertical = $layoutButton.value === 'vertical';
    var smartButtonStyleConfigs;

    document.querySelector(PAYPAL_CART_BUTTON_CLASS_SELECTOR).innerHTML = '';
    fadeAlerts();

    if (isTaglineButton && isLayoutVertical) {
        $layoutButton.value = 'horizontal';
        showAlerts(window.resourcesAlertMessages.tagline);
    }

    smartButtonStyleConfigs = getSmartButtonStyleConfigs();
    renderPaypalButton(smartButtonStyleConfigs);
});

$locationButton.addEventListener('change', () => {
    const savedSmartStyles = JSON.parse(
        $smartbuttonConfigForm.getAttribute(DATA_SMART_STYLE_SELECTOR)
    );
    const locationButton = $locationButton.value;

    document.querySelector(PAYPAL_CART_BUTTON_CLASS_SELECTOR).innerHTML = '';
    fadeAlerts();
    savedSmartStyles[locationButton].location = locationButton;
    updateValuesWithStyleConfigs(savedSmartStyles[locationButton]);

    window.paypal.Buttons({
        onInit: (_, actions) => {
            return actions.disable();
        },
        createOrder: () => { },
        onApprove: () => { },
        onCancel: () => { },
        onError: () => { },
        style: savedSmartStyles[locationButton]
    }).render(PAYPAL_CART_BUTTON_CLASS_SELECTOR).then(function () {
        window.scrollTo(0, 0);
    });
});

$smartbuttonConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-undef
    jQuery.post(e.currentTarget.action, e.currentTarget.serialize())
        .done(function (data) {
            location.href = data.redirectUrl;
        })
        .fail(function (err) {
            showAlerts({
                message: err.responseText,
                type: 'danger'
            });
        });
    return false;
});
