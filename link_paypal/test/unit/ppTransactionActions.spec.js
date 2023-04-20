const { ppTransactionActionsPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const { stub } = require('sinon');


require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const createNewTransactionCustomObject = stub();
const updateOrderData = stub();
const returnObject = (reqData) => {
    if (!reqData.err) {
        return {
            responseData: { transactionId: reqData.id }
        };
    }
    return {
        err: reqData.err,
        responseData: { errorMessage: 'There is some error happened' }
    };
};

const ppTransactionActions = proxyquire(ppTransactionActionsPath, {
    '*/cartridge/models/ppOrderMgr': () => {
        return {
            createNewTransactionCustomObject,
            updateOrderData
        };
    },
    '*/cartridge/scripts/paypal/paypalApi/ppRestApiWrapper': () => {
        return {
            createTransaction: returnObject,
            doVoid: returnObject,
            doReauthorize: returnObject,
            doRefundTransaction: returnObject,
            doCapture: returnObject
        };
    }
});

describe('ppTransactionActions file', () => {
    var dataErrorTrue = { err: true, id: 25 };
    var dataErrorFalse = { err: false, id: 25 };
    var expectedObj = { err: true, responseData: { errorMessage: 'There is some error happened' } };
    var expectedObjErrorFalse = { responseData: { transactionId: 25 } };
    var result = new ppTransactionActions();

    it('ppTransactionActions is a function', () => {
        expect(ppTransactionActions).to.be.an('function');
    });
    it('The prototype of ppTransactionActions has property createTransactionAction that is a function', () => {
        expect(new ppTransactionActions()).to.have.property('createTransactionAction').to.be.a('function');
    });
    it('The prototype of ppTransactionActions has property voidAction that is a function', () => {
        expect(new ppTransactionActions()).to.have.property('voidAction').to.be.a('function');
    });
    it('The prototype of ppTransactionActions has property reauthorizeAction that is a function.', () => {
        expect(new ppTransactionActions()).to.have.property('reauthorizeAction').to.be.a('function');
    });
    it('The prototype of ppTransactionActions has property refundTransactionAction that is a function.', () => {
        expect(new ppTransactionActions()).to.have.property('reauthorizeAction').to.be.a('function');
    });
    it('The prototype of ppTransactionActions has property captureAction that is a function.', () => {
        expect(new ppTransactionActions()).to.have.property('captureAction').to.be.a('function');
    });

    describe('PPTransactionAction.createTransactionAction', () => {
        it('if callApiResponse.err true should return { err: true, responseData:{ errorMessage: \'There is some error happened\' } }', () => {
            expect(result.createTransactionAction(dataErrorTrue)).to.deep.equal(expectedObj);
        });
        it('if callApiResponse.err is falthy should return {responseData: { transactionId: 25 } }', () => {
            expect(result.createTransactionAction(dataErrorFalse)).to.deep.equal(expectedObjErrorFalse);
        });
        it('if callApiResponse.err false and createNewTransactionCustomObject throw error should return { err: true }', () => {
            createNewTransactionCustomObject.throws();
            expect(result.createTransactionAction(dataErrorFalse)).to.deep.equal({ err: true });
        });
    });

    describe('PPTransactionAction.voidAction', () => {
        it('if callApiResponse.err true should return { err: true, responseData: { errorMessage: \'There is some error happened\'  } }', () => {
            expect(result.voidAction(dataErrorTrue)).to.deep.equal(expectedObj);
        });
        it('if callApiResponse.err is true and orderTransactionResult is false should return { err: true}', () => {
            updateOrderData.returns(false);
            expect(result.voidAction(dataErrorFalse)).to.deep.equal({ err: true });
        });
        it('if callApiResponse.err is falsthy and orderTransactionResult is true should return { err: true}', () => {
            updateOrderData.returns(true);
            expect(result.voidAction(dataErrorFalse)).to.deep.equal(expectedObjErrorFalse);
        });
    });

    describe('PPTransactionAction.reauthorizeAction', () => {
        it('if callApiResponse.err is true should return { err: true, responseData: { errorMessage: \'There is some error happened\' } }', () => {
            expect(result.reauthorizeAction(dataErrorTrue)).to.deep.equal(expectedObj);
        });
        it('if callApiResponse.err is false and orderTransactionResult is false should return { err: true}', () => {
            updateOrderData.returns(false);
            expect(result.reauthorizeAction(dataErrorFalse)).to.deep.equal({ err: true });
        });
        it('if callApiResponse.err is falthy and orderTransactionResult is true should return { responseData: { transactionId: 25 }}', () => {
            updateOrderData.returns(true);
            expect(result.reauthorizeAction(dataErrorFalse)).to.deep.equal(expectedObjErrorFalse);
        });
    });

    describe('PPTransactionAction.refundTransactionAction', () => {
        it('if callApiResponse.err is true should return { err: true, responseData: { errorMessage: \'There is some error happened\' } }', () => {
            expect(result.refundTransactionAction(dataErrorTrue)).to.deep.equal(expectedObj);
        });
        it('if callApiResponse.err is false and orderTransactionResult is false should return { err: true}', () => {
            updateOrderData.returns(false);
            expect(result.refundTransactionAction(dataErrorFalse)).to.deep.equal({ err: true });
        });
        it('if callApiResponse.err is falthy and orderTransactionResult is true should return { responseData: { transactionId: 25 } }', () => {
            updateOrderData.returns(true);
            expect(result.refundTransactionAction(dataErrorFalse)).to.deep.equal(expectedObjErrorFalse);
        });
    });

    describe('PPTransactionAction.captureAction', () => {
        it('if callApiResponse.err is true should return { err: true, responseData: { errorMessage: \'There is some error happened\' } }', () => {
            expect(result.captureAction(dataErrorTrue)).to.deep.equal(expectedObj);
        });
        it('if callApiResponse.err is false and orderTransactionResult is false should return { err: true}', () => {
            updateOrderData.returns(false);
            expect(result.captureAction(dataErrorFalse)).to.deep.equal({ err: true });
        });
        it('if callApiResponse.err is falthy and orderTransactionResult is true should return { responseData: { transactionId: 25 } }', () => {
            updateOrderData.returns(true);
            expect(result.captureAction(dataErrorFalse)).to.deep.equal(expectedObjErrorFalse);
        });
    });
});
