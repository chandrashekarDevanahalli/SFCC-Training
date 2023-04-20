const { bmPaypalUtilsPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');

const Logger = proxyquire(bmPaypalUtilsPath, {
    'dw/system/Logger': {
        getLogger: () => {
            return {
                error: () => 'error',
                debug: () => 'Empty log entry'
            };
        }
    }
});

require('dw-api-mock/demandware-globals');

describe('bmPaypalUtils', () => {
    let msg = 'tets';
    it('bmPaypalUtils has property createErrorLog', function () {
        expect(Logger).has.property('createErrorLog');
    });
    it('bmPaypalUtils createErrorLog is function', function () {
        expect(Logger.createErrorLog).to.be.a('function');
    });
    it('bmPaypalUtils createErrorLog returns undefined', () => {
        expect(Logger.createErrorLog()).to.be.a('undefined');
    });
    it('bmPaypalUtils createErrorLog returns undefined', () => {
        expect(Logger.createErrorLog(msg)).to.be.a('undefined');
    });
});
