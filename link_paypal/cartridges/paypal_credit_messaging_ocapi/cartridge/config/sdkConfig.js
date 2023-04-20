'use strict';

const AllowedCurrencies = [
    'AUD',
    'BRL',
    'CAD',
    'CHF',
    'CZK',
    'DKK',
    'EUR',
    'HKD',
    'HUF',
    'INR',
    'ILS',
    'JPY',
    'MYR',
    'MXN',
    'TWD',
    'NZD',
    'NOK',
    'PHP',
    'PLN',
    'GBP',
    'RUB',
    'SGD',
    'SEK',
    'THB',
    'USD'
];
const DisableFunds = [
    'sepa',
    'bancontact',
    'eps',
    'giropay',
    'ideal',
    'mybank',
    'p24',
    'sofort'
];
const SmartButtonStyles = JSON.parse(require('dw/system/Site').current.getCustomPreferenceValue('PP_API_Smart_Button_Styles'));
const PaypalStaticImageLink = 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png';

module.exports = {
    disableFunds: DisableFunds,
    allowedCurrencies: AllowedCurrencies,
    paypalBillingButtonConfig: { style: SmartButtonStyles.billing },
    paypalCartButtonConfig: { style: SmartButtonStyles.cart },
    paypalPdpButtonConfig: { style: SmartButtonStyles.pdp },
    paypalMinicartButtonConfig: { style: SmartButtonStyles.minicart },
    paypalStaticImageLink: PaypalStaticImageLink
};
