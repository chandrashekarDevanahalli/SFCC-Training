var { expect } = require('chai');
var { sdkConfigPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const sdkConfig = proxyquire(sdkConfigPath, {
    'dw/system/Site': {
        current: {
            getCustomPreferenceValue: () => JSON.stringify({})
        }
    }
});

describe('sdkConfig', () => {
    it('response type should be object', () => {
        expect(sdkConfig).to.be.a('object');
    });
    it('response object should has property allowedCurrencies', () => {
        expect(sdkConfig).has.property('allowedCurrencies');
    });
    it('property allowedCurrencies should be equal the array of allowed currencies', () => {
        expect(sdkConfig.allowedCurrencies).to.have.members([
            'AUD', 'BRL', 'CAD', 'CHF', 'CZK', 'DKK', 'EUR', 'HKD', 'HUF', 'INR', 'ILS', 'JPY',
            'MYR', 'MXN', 'TWD', 'NZD', 'NOK', 'PHP', 'PLN', 'GBP', 'RUB', 'SGD', 'SEK', 'THB', 'USD'
        ]);
    });
    it('response object should has property disableFunds', () => {
        expect(sdkConfig).has.property('disableFunds');
    });
    it('response object has property disableFunds that consist of precise members', () => {
        expect(sdkConfig.disableFunds).to.have.members([
            'sepa', 'bancontact', 'eps', 'giropay', 'ideal', 'mybank', 'p24', 'sofort'
        ]);
    });
    it('response object should has the property paypalStaticImageLink', () => {
        expect(sdkConfig).has.property('paypalStaticImageLink');
    });
    it('response object should has the property connectWithPaypalStaticImageLink', () => {
        expect(sdkConfig).has.property('connectWithPaypalStaticImageLink');
    });
    it('response object has the property paypalBillingButtonConfig', () => {
        expect(sdkConfig).has.property('paypalBillingButtonConfig');
    });
    it('response object has the property paypalCartButtonConfig', () => {
        expect(sdkConfig).has.property('paypalCartButtonConfig');
    });
    it('response object has the  property paypalPdpButtonConfig', () => {
        expect(sdkConfig).has.property('paypalPdpButtonConfig');
    });
    it('response object has the property paypalMinicartButtonConfig', () => {
        expect(sdkConfig).has.property('paypalMinicartButtonConfig');
    });
});
