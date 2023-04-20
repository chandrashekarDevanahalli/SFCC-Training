var { expect } = require('chai');
var { paypalConstantsPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const paypalConstants = proxyquire(paypalConstantsPath, {});

describe('paypalConstants', () => {
    it('response type should be object', () => {
        expect(paypalConstants).to.be.a('object');
    });
    it('response object should consist property ACCESS_TOKEN', () => {
        expect(paypalConstants).has.property('ACCESS_TOKEN');
    });
    it('response object should consist property USER_INFO', () => {
        expect(paypalConstants).has.property('USER_INFO');
    });
    it('response object should consist property VERIFY_WH_SIG', () => {
        expect(paypalConstants).has.property('VERIFY_WH_SIG');
    });

    it('response object should consist property PAYMENT_AUTHORIZATION_VOIDED', () => {
        expect(paypalConstants).has.property('PAYMENT_AUTHORIZATION_VOIDED');
    });
    it('response object should consist property PAYMENT_CAPTURE_REFUNDED', () => {
        expect(paypalConstants).has.property('PAYMENT_CAPTURE_REFUNDED');
    });
    it('response object should consist property PAYMENT_CAPTURE_COMPLETED', () => {
        expect(paypalConstants).has.property('PAYMENT_CAPTURE_COMPLETED');
    });
    it('response object should consist property STATUS_SUCCESS', () => {
        expect(paypalConstants).has.property('STATUS_SUCCESS');
    });
    it('response object should consist property METHOD_POST', () => {
        expect(paypalConstants).has.property('METHOD_POST');
    });
    it('response object should consist property METHOD_GET', () => {
        expect(paypalConstants).has.property('METHOD_GET');
    });
    it('response object should consist property PAYMENT_STATUS_REFUNDED', () => {
        expect(paypalConstants).has.property('PAYMENT_STATUS_REFUNDED');
    });
    it('response object should consist property CONNECT_WITH_PAYPAL_CONSENT_DENIED', () => {
        expect(paypalConstants).has.property('CONNECT_WITH_PAYPAL_CONSENT_DENIED');
    });
    it('response object should consist property ENDPOINT_ACCOUNT_SHOW', () => {
        expect(paypalConstants).has.property('ENDPOINT_ACCOUNT_SHOW');
    });
    it('response object should consist property ENDPOINT_CHECKOUT_LOGIN', () => {
        expect(paypalConstants).has.property('ENDPOINT_CHECKOUT_LOGIN');
    });
    it('response object should consist property PAYMENT_METHOD_ID_PAYPAL', () => {
        expect(paypalConstants).has.property('PAYMENT_METHOD_ID_PAYPAL');
    });
    it('response object should consist property PAYMENT_METHOD_ID_VENMO', () => {
        expect(paypalConstants).has.property('PAYMENT_METHOD_ID_VENMO');
    });
});
