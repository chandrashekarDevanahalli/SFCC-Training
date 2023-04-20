/* eslint-disable no-underscore-dangle */
const { enableFundingHelperPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const { stub } = require('sinon');


require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});
const enableFundingHelper = proxyquire(enableFundingHelperPath, {
});
const SDKUrlEnable = 'https://www.paypal.com/sdk/js?client-id=AdYw0mYpZkz6qk3RNTmDTDAnNhWwUpL_zawBcv7wjinBmcm9b-10rKlRDwmRUzjcOwScbT9xDsiodvAu&commit=false&components=buttons,messages&intent=authorize&currency=USD&enable-funding=sepa,bancontact,eps,giropay,ideal,mybank,p24';
const arrayFromSDKUrl = SDKUrlEnable.split('&');
const SDKUrlDisable = 'https://www.paypal.com/sdk/js?client-id=AdYw0mYpZkz6qk3RNTmDTDAnNhWwUpL_zawBcv7wjinBmcm9b-10rKlRDwmRUzjcOwScbT9xDsiodvAu&commit=false&components=buttons,messages&intent=authorize&currency=USD&disable-funding=sepa,bancontact,eps,giropay,ideal,mybank,p24';
const findSubstringPosition = enableFundingHelper.__get__('findSubstringPosition');
const enableFundingValueModify = enableFundingHelper.__get__('enableFundingValueModify');
const initialPosition = 5;

describe('enableFundingHelper file', function () {
    describe('findSubstringPosition function', function () {
        it('findSubstringPosition has to be equal 5', () => {
            expect(findSubstringPosition(arrayFromSDKUrl, 'enable-funding=')).equal(initialPosition);
        });
        it('findSubstringPosition has to be equal -1', () => {
            expect(findSubstringPosition(arrayFromSDKUrl, 'enabl_e-funding=')).equal(-1);
        });
    });
    describe('enableFundingValueModify function', function () {
        it('enableFundingValueModify has to be equal 1', () => {
            expect(enableFundingValueModify(arrayFromSDKUrl, initialPosition)).to.deep.equal('enable-funding=paylater,sepa,bancontact,eps,giropay,ideal,mybank,p24');
        });
    });
    describe('addEnableFundigParamPaylater function if statement is true', function () {
        before(() => {
            enableFundingHelper.__set__('findSubstringPosition', () => {
                return initialPosition;
            });
            enableFundingHelper.__set__('enableFundingValueModify', () => {
                return 'enable-funding=paylater,sepa,bancontact,eps,giropay,ideal,mybank,p24';
            });
        });
        after(() => {
            enableFundingHelper.__ResetDependency__('findSubstringPosition', () => {
                return undefined;
            });
        });
        it('Have to return expected object with changed \'enable-funding paramenter\'', () => {
            const expectedArray = SDKUrlEnable.split('&');
            expectedArray[initialPosition] = expectedArray[initialPosition].replace('enable-funding=', 'enable-funding=paylater,');
            expect(enableFundingHelper.addEnableFundigParamPaylater(SDKUrlEnable)).to.deep.equal(expectedArray.join('&'));
        });
    });
    describe('addEnableFundigParamPaylater function if the if-statememt is false', function () {
        before(() => {
            enableFundingHelper.__set__('findSubstringPosition', () => {
                return -1;
            });
        });
        after(() => {
            enableFundingHelper.__ResetDependency__('findSubstringPosition', () => {
                return undefined;
            });
        });
        it('Have to return expected object with new  \'enable-funding paramenter\'', () => {
            const expectedArray = SDKUrlDisable.split('&');
            expectedArray.splice(initialPosition, 0, 'enable-funding=paylater');
            expect(enableFundingHelper.addEnableFundigParamPaylater(SDKUrlDisable)).to.deep.equal(expectedArray.join('&'));
        });
    });
});
