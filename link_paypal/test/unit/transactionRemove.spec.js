const { transactionRemovePath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');

const transactionRemove = proxyquire(transactionRemovePath, {
    'dw/object/CustomObjectMgr': {
        remove: () => true,
        queryCustomObjects: () => {
            return {
                hasNext: () => false,
                next: () => false
            };
        }
    }
});

require('dw-api-mock/demandware-globals');

describe('transactionRemove', () => {
    it('transactionRemove has property execute', function () {
        expect(transactionRemove).has.property('execute');
    });
    it('transactionRemove execute is function', function () {
        expect(transactionRemove.execute).to.be.a('function');
    });
    it('transactionRemove execute returns undefined', () => {
        expect(transactionRemove.execute()).to.be.a('undefined');
    });
});
