var { expect } = require('chai');
var { bm_paypalConstantsPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const paypalConstants = proxyquire(bm_paypalConstantsPath, {});

describe('paypalConstants from bm_paypal cartridge', () => {
    it('response type should be object', () => {
        expect(paypalConstants).to.be.a('object');
    });
    it('response object should consist property SEARCH_BY_TRANSACTION_ID', () => {
        expect(paypalConstants).has.property('SEARCH_BY_TRANSACTION_ID');
    });
    it('response object should consist property SEARCH_BY_ORDER_NUMBER', () => {
        expect(paypalConstants).has.property('SEARCH_BY_ORDER_NUMBER');
    });
    it('response object should consist property INTENT_CAPTURE', () => {
        expect(paypalConstants).has.property('INTENT_CAPTURE');
    });

    it('response object should consist property STATUS_COMPLETED', () => {
        expect(paypalConstants).has.property('STATUS_COMPLETED');
    });
    it('response object should consist property STATUS_CAPTURED', () => {
        expect(paypalConstants).has.property('STATUS_CAPTURED');
    });
    it('response object should consist property STATUS_REFUNDED', () => {
        expect(paypalConstants).has.property('STATUS_REFUNDED');
    });
    it('response object should consist property STATUS_CREATED', () => {
        expect(paypalConstants).has.property('STATUS_CREATED');
    });
    it('response object should consist property PAYMENT_ACTION_AUTHORIZATION', () => {
        expect(paypalConstants).has.property('PAYMENT_ACTION_AUTHORIZATION');
    });
    it('response object should consist property PAYMENT_ACTION_AUTHORIZE', () => {
        expect(paypalConstants).has.property('PAYMENT_ACTION_AUTHORIZE');
    });
    it('response object should consist property PAYMENT_ACTION_CAPTURE', () => {
        expect(paypalConstants).has.property('PAYMENT_ACTION_CAPTURE');
    });
    it('response object should consist property ACTION_CREATE_TRANSACTION', () => {
        expect(paypalConstants).has.property('ACTION_CREATE_TRANSACTION');
    });
    it('response object should consist property ACTION_VOID', () => {
        expect(paypalConstants).has.property('ACTION_VOID');
    });
    it('response object should consist property ACTION_REAUTHORIZE', () => {
        expect(paypalConstants).has.property('ACTION_REAUTHORIZE');
    });
    it('response object should consist property ACTION_REFUND', () => {
        expect(paypalConstants).has.property('ACTION_REFUND');
    });
    it('response object should consist property ACTION_CAPTURE', () => {
        expect(paypalConstants).has.property('ACTION_CAPTURE');
    });
    it('response object should consist property SERVICE_NAME', () => {
        expect(paypalConstants).has.property('SERVICE_NAME');
    });
    it('response object should consist property UNKNOWN', () => {
        expect(paypalConstants).has.property('UNKNOWN');
    });
    it('response object should consist property PARTNER_ATTRIBUTION_ID', () => {
        expect(paypalConstants).has.property('PARTNER_ATTRIBUTION_ID');
    });
    it('response object should consist property ACTION_STATUS_SUCCESS', () => {
        expect(paypalConstants).has.property('ACTION_STATUS_SUCCESS');
    });
    it('response object should consist property TOKEN_TYPE_BILLING_AGREEMENT', () => {
        expect(paypalConstants).has.property('TOKEN_TYPE_BILLING_AGREEMENT');
    });
    it('response object should consist property INVALID_CLIENT', () => {
        expect(paypalConstants).has.property('INVALID_CLIENT');
    });
});
