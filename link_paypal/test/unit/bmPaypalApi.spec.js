/* eslint-disable no-underscore-dangle */
var { expect } = require('chai');
const { stub } = require('sinon');
var { bmPaypalApiPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});
const createErrorLog = stub();
let createPaypalRestService = () => {
    return {
        getResponse: () => {
            return { name: 'response data' };
        },
        call: () => {
            return { isOk: () => true };
        }
    };
};

const bmPaypalApi = proxyquire(bmPaypalApiPath, {
    '*/cartridge/scripts/paypal/bmPaypalUtils': { createErrorLog },
    '*/cartridge/scripts/util/paypalConstants': { ppConstants: {
        SERVICE_NAME: 'int_paypal.http.rest',
        PARTNER_ATTRIBUTION_ID: 'SFCC_EC_B2C_2022_1_0',
        TOKEN_TYPE_BILLING_AGREEMENT: 'BILLING_AGREEMENT'

    } },
    '*/cartridge/scripts/service/bmPaypalRestService': createPaypalRestService
});
describe('bmPaypalApi file', () => {
    const call = bmPaypalApi.__get__('call');
    let requestData = {
        body: {},
        method: 'GET',
        path: 'v2/checkout/orders/',
        result: undefined
    };
    describe('call function should return response object', () => {
        it('call return eeeee', () => {
            expect(call(requestData)).to.deep.equal({
                name: 'response data'
            });
        });
    });
    describe('getOrderDetails function', () => {
        before(() => {
            bmPaypalApi.__set__('call', (id) => {
                requestData.path += id;
                return requestData;
            });
        });
        after(() => {
            bmPaypalApi.__ResetDependency__(()=>{
                return undefined;
            });
        });
        it('getOrderDetails should return particular object', () => {
            expect(bmPaypalApi.getOrderDetails('73R2506398473783H')).to.deep.equal(requestData);
        });
    });
});
