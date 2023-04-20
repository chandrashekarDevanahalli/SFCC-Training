var { expect } = require('chai');
var { postAuthorizationHandlingPath } = require('./path');

const proxyquire = require('proxyquire').noCallThru();
require('dw-api-mock/demandware-globals');

const postAuthorizationHandling = proxyquire(postAuthorizationHandlingPath, {
    '*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper': {
        getPaypalPaymentInstrument: (order) => {
            return {
                custom: {
                    PP_API_ActiveBillingAgreement: JSON.stringify(order)
                }
            };
        }
    },
    '*/cartridge/models/billingAgreement': () => {
        return {
            isAccountAlreadyExist: emailBA => !empty(emailBA),
            updateBillingAgreement: activeBAUpdate => activeBAUpdate,
            saveBillingAgreement: activeBASave => activeBASave
        };
    }
});

describe('postAuthorizationHandling file', () => {
    describe('postAuthorizationHandling file', () => {
        it('postAuthorizationHandling should have property postAuthorization', () => {
            expect(postAuthorizationHandling).has.ownProperty('postAuthorization');
        });

        it('property postAuthorization is function', () => {
            expect(postAuthorizationHandling.postAuthorization).to.be.a('function');
        });
    });
    describe('postAuthorizationHandling file isActiveBillingAgreement==true', () => {
        let result;
        let order;

        before(() => {
            customer.authenticated = true;
            order = { email: 'sfra@gmail.com' };
        });
        afterEach(() => {
            order = {};
        });

        it('isAccountAlreadyExist is true and return is still object', () => {
            expect(postAuthorizationHandling.postAuthorization(result, order)).to.be.a('object');
        });
        it('isAccountAlreadyExist is false and return is still object', () => {
            expect(postAuthorizationHandling.postAuthorization(result, order)).to.be.a('object');
        });
    });
});
