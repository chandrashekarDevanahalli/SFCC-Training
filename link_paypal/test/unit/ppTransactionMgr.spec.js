const proxyquire = require('proxyquire').noCallThru();

var { expect } = require('chai');
var { ppTransactionMgrPath } = require('./path');

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const ppTransactionMgr = proxyquire(ppTransactionMgrPath, {
    '*/cartridge/scripts/paypal/bmPaypalUtils': () => { },
    '*/cartridge/scripts/paypal/paypalApi/ppRestApiWrapper': () => { return { getOrderDetails: { transactionID: '3', err: false } }; }
});

describe('ppTransactionMgr file', () => {
    // eslint-disable-next-line no-underscore-dangle
    const getTransactionID = ppTransactionMgr.__get__('getTransactionID');

    describe('getTransactionID function', () => {
        var transactionIdFromOrder;
        var hm;

        describe('if condition is true', () => {
            before(() => {
                transactionIdFromOrder = 'transactionIdFromOrder';
                hm = {
                    transactionId: {
                        stringValue: 'stringValue'
                    }
                };
            });

            it('response type should be equal "string"', () => {
                expect(getTransactionID(hm, transactionIdFromOrder)).to.be.a('string');
            });

            it('response should be equal transactionIdFromOrder', () => {
                expect(getTransactionID(hm, transactionIdFromOrder)).equal(transactionIdFromOrder);
            });
        });

        describe('if condition is false', () => {
            before(() => {
                transactionIdFromOrder = null;
                hm = {
                    transactionId: {
                        stringValue: 'stringValue'
                    }
                };
            });

            it('response type should be equal string', () => {
                expect(getTransactionID(hm, transactionIdFromOrder)).to.be.a('string');
            });

            it('response should be equal stringValue', () => {
                expect(getTransactionID(hm, transactionIdFromOrder)).equal('stringValue');
            });
        });
    });
    describe('TransactionMgrModel', () => {
        it('response type should be equal empty object', () => {
            expect(ppTransactionMgr.TransactionMgrModel).to.be.undefined;
        });
    });
});
