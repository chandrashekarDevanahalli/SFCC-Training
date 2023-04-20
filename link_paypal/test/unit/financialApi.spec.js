var { expect } = require('chai');
var { financialApiPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');

const financialService = proxyquire(financialApiPath, {
    '*/cartridge/scripts/paypal/paypalUtils': {},
    '*/cartridge/scripts/service/paypalRestService': {
        call: (type, url, data) => {
            return {
                requestUrl: 'https://developer.paypal.com/docs/limited-release/financing-options/api/' + url,
                requestType: type,
                requestData: data
            };
        }
    }
});

describe('financialApi file', () => {
    describe('getCalculatedFinancingOptions', () => {
        const data = {};
        it('response type should be equal -> object', () => {
            expect(financialService.getCalculatedFinancingOptions(data)).to.be.a('object');
        });
    });
});
