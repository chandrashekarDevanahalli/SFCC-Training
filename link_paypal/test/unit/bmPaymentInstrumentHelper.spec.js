/* eslint-disable no-underscore-dangle */
const { bmPaymentInstrumentHelperPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const { stub } = require('sinon');

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const bmPaymentInstrumentHelper = proxyquire(bmPaymentInstrumentHelperPath, {
    'dw/order/PaymentMgr': dw.order.PaymentMgr
});
describe('bmPaymentInstrumentHelper file', function () {

    let activePaymentMethods = [
        {
            active: true,
            ID: 'ApplePay',
            paymentProcessor: {
                ID: 'PAYPAL_ApplePay'
            }
        },
        {
            active: true,
            ID: 'PAYPAL',
            paymentProcessor: {
                ID: 'PAYPAL'
            }
        }
    ];
    before(() => {
        Array.some = function (a, b) {
            return Array.prototype.some.call(a, b);
        };
        stub(dw.order.PaymentMgr, 'getActivePaymentMethods');
    });
    after(() => {
        dw.order.PaymentMgr.getActivePaymentMethods.restore();
    });
    describe('getPaypalPaymentMethodId function', function () {
        const getPaypalPaymentMethodId = bmPaymentInstrumentHelper.__get__('getPaypalPaymentMethodId');
        it('getPaypalPaymentMethodId should return \'PAYPAL\' if activePaymentMethods has PAYPAL active method', function () {
            dw.order.PaymentMgr.getActivePaymentMethods.returns(activePaymentMethods);
            expect(getPaypalPaymentMethodId()).to.be.equal('PAYPAL');
        });
        it('getPaypalPaymentMethodId should return \'undefined\' if activePaymentMethods hasn\'t PAYPAL active method', function () {
            dw.order.PaymentMgr.getActivePaymentMethods.returns([activePaymentMethods[0]]);
            expect(getPaypalPaymentMethodId()).to.be.equal(undefined);
        });
    });
    describe('getPaypalPaymentInstrument function', function () {
        let basket = {
            getPaymentInstruments: stub()
        };
        before(() => {
            bmPaymentInstrumentHelper.__set__('getPaypalPaymentMethodId', () => false);
        });
        after(() => {
            bmPaymentInstrumentHelper.__ResetDependency__('getPaypalPaymentMethodId');
        });

        const paymentInstrumentObject = [{
            paymentMethod: 'PayPal',
            UUID: '49c7ed508ac1dd8182bf3018c9',
            ID: 'PAYPAL'
        }];

        it('getPaypalPaymentInstrument should return payment instrument object with id PAYPAL', function () {
            basket.getPaymentInstruments.returns(paymentInstrumentObject);
            expect(bmPaymentInstrumentHelper.getPaypalPaymentInstrument(basket)).to.deep.equal(paymentInstrumentObject[0]);
        });
        it('getPaypalPaymentInstrument should return false', function () {
            basket.getPaymentInstruments.returns('');
            expect(bmPaymentInstrumentHelper.getPaypalPaymentInstrument(basket)).to.equal(false);
        });
    });
});
