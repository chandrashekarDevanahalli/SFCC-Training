var { expect } = require('chai');
var { creditMessageConfigPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const creditMessageConfig = proxyquire(creditMessageConfigPath, {
    'dw/system/Site': {
        current: {
            getCustomPreferenceValue: () => JSON.stringify(
                {
                    cartCreditConfig: {},
                    productCreditConfig: {},
                    categoryCreditConfig: {}
                })
        }
    }
});

describe('creditMessageConfig', () => {
    it('response type should be object', () => {
        expect(creditMessageConfig).to.be.a('object');
    });

    it('response object should has property cartMessageConfig', () => {
        expect(creditMessageConfig).has.property('cartMessageConfig');
    });
    it('response object property cartMessageConfig is object', () => {
        expect(creditMessageConfig.cartMessageConfig).to.be.a('object');
    });

    it('response object should has property productDetailMessageConfig', () => {
        expect(creditMessageConfig).has.property('productDetailMessageConfig');
    });
    it('response object property productDetailMessageConfig is object', () => {
        expect(creditMessageConfig.productDetailMessageConfig).to.be.a('object');
    });
    it('response object should has property categoryMessageConfig', () => {
        expect(creditMessageConfig).has.property('categoryMessageConfig');
    });
    it('response object property categoryMessageConfig is object', () => {
        expect(creditMessageConfig.categoryMessageConfig).to.be.a('object');
    });
});
