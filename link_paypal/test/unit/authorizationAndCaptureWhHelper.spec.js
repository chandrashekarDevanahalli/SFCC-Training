const { authorizationAndCaptureWhHelperPath } = require('./path');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});
const authorizationAndCaptureWhHelper =
    proxyquire(authorizationAndCaptureWhHelperPath, {
        'dw/system/Transaction': dw.system.Transaction,
        '*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper': { getPaypalPaymentInstrument: (order)=> typeof order },
        'dw/object/CustomObject': dw.object.CustomObject
    });

describe('autorizationAndCaptureWhHelper', () => {
    it('authorizationAndCaptureWhHelper is object', () => {
        expect(authorizationAndCaptureWhHelper).to.be.a('object');
    });

    it('authorizationAndCaptureWhHelper has own property updateOrderPaymentStatus', () => {
        expect(authorizationAndCaptureWhHelper).to.haveOwnProperty('updateOrderPaymentStatus');
    });

    it('authorizationAndCaptureWhHelper.updateOrderPaymentStatus is a function', () => {
        expect(authorizationAndCaptureWhHelper.updateOrderPaymentStatus).to.be.a('function');
    });
});
