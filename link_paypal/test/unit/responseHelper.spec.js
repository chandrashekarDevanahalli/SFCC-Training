var { expect } = require('chai');
var { responseHelperPath } = require('./path');
var { stub } = require('sinon');

require('dw-api-mock/demandware-globals');

const responseHelper = require('proxyquire').noCallThru()(responseHelperPath, {
    'dw/template/ISML': dw.template.ISML
});

describe('responseHelper file', () => {
    let templateName = 'template';
    let data;
    before(() => {
        stub(dw.template.ISML, 'renderTemplate');
        dw.template.ISML.renderTemplate.withArgs('template', {}).returns('This template was successfully rendered!');
    });
    after(() => {
        dw.template.ISML.renderTemplate.restore();
    });

    describe('render', () => {
        it('response type should be undefined', () => {
            expect(responseHelper.render(templateName, data)).to.be.a('undefined');
        });
    });

    describe('renderJson', () => {
        let result = null;
        let message = 'Some message';
        let additionalData = {};

        describe('If result is empty', () => {
            it('response type should be undefined', () => {
                expect(responseHelper.renderJson(result, message, additionalData)).to.be.a('undefined');
            });
        });

        describe('If result is not empty', () => {
            result = {};
            it('response type should be undefined', () => {
                expect(responseHelper.renderJson(result, message, additionalData)).to.be.a('undefined');
            });
        });
    });
});
