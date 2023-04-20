/* eslint-disable no-underscore-dangle */
var { expect } = require('chai');
const { stub } = require('sinon');
var { processorPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const createPaymentInstrument = stub();
const createBaFromForm = stub();
const getPurchaseUnit = stub();
const isPurchaseUnitChanged = stub();
const createErrorLog = stub();
const encodeString = stub();
const updateOrderBillingAddress = stub();
const updateBABillingAddress = stub();
const getOrderDetails = stub();
const getBADetails = stub();
const updateOrderDetails = stub();
const createTransaction = stub();
const createOrder = stub();
const paypalConstants = stub();
const getTransactionId = stub();
const getTransactionStatus = stub();

const processor = proxyquire(processorPath, {
    'dw/order/Order': dw.order.Order,
    'dw/system/Transaction': dw.system.Transaction,
    'dw/web/Resource': dw.web.Resource,
    '*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper': { createPaymentInstrument },
    '*/cartridge/scripts/paypal/helpers/billingAgreementHelper': { createBaFromForm },
    '*/cartridge/scripts/paypal/helpers/paypalHelper': {
        getPurchaseUnit,
        isPurchaseUnitChanged,
        getTransactionId,
        getTransactionStatus
    },
    '*/cartridge/scripts/paypal/paypalUtils': {
        createErrorLog,
        encodeString
    },
    '*/cartridge/scripts/paypal/helpers/addressHelper': {
        updateOrderBillingAddress,
        updateBABillingAddress
    },
    '*/cartridge/scripts/paypal/paypalApi': {
        getOrderDetails,
        getBADetails,
        updateOrderDetails,
        createTransaction,
        createOrder
    },
    '*/cartridge/scripts/util/paypalConstants': { paypalConstants }
});

describe('processor file', () => {
    describe('handle function', () => {
        before(() => {
            stub(dw.web.Resource, 'msg');
            dw.web.Resource.msg.returns('Some server error');
            session = {
                privacy: {
                    paypalPayerEmail: ''

                }
            };
        });
        after(() => {
            dw.web.Resource.msg.restore();
        });
        let paymentInformation = {
            billingForm: {
                paypal: {
                    billingAgreementID: {
                        maxLength: 2147483647,
                        minLength: 0,
                        regEx: null,
                        valid: true
                    },
                    paypalOrderID: {},
                    usedPaymentMethod: {}
                },
                paymentMethod: {
                    htmlName: 'PayPal',
                    value: 'PayPal'
                }
            }
        };
        let payer = {
            address: {},
            email_address: 'I.VinogradovVN@gmail.com',
            name: {},
            payer_id: 'QMG34HJTGX6NU',
            phone_number: {
                national_number: '4084607119',
                phone_type: 'HOME'
            }
        };
        let purchase_units = [{
            amount: {},
            description: 'Casual Spring Easy Jacket',
            invoice_id: '00003402',
            payee: {
                email_address: 'user@business.example.com',
                merchant_id: 'BZKDAFFRXNJ7G'
            }
        }];
        let basket = {};
        it('handle function returns an expected object if isBillingAgreementID is false', () => {
            createPaymentInstrument.returns(
                {
                    paymentMethod: 'PayPal',
                    UUID: 'ee6d20764050743b97cab7e8f6',
                    custom: {
                        paypalOrderID: '8UU486582S253361B'
                    }
                }
            );
            getOrderDetails.returns({
                payer,
                purchase_units

            });
            let expectedObj = {
                success: true,
                paymentInstrument: {
                    paymentMethod: 'PayPal',
                    UUID: 'ee6d20764050743b97cab7e8f6',
                    custom:
                    {
                        paypalOrderID: undefined,
                        currentPaypalEmail: 'I.VinogradovVN@gmail.com',
                        paymentId: undefined
                    }
                },
                shippingAddress: {
                    amount: {},
                    description: 'Casual Spring Easy Jacket',
                    invoice_id: '00003402',
                    payee:
                    {
                        email_address: 'user@business.example.com',
                        merchant_id: 'BZKDAFFRXNJ7G'
                    },
                    phone: undefined
                }
            };
            expect(processor.handle(basket, paymentInformation)).to.deep.equal(expectedObj);
        });
        it('handle function returns an error object if isBillingAgreementID is false and OrderDetailsError isn\'t empty', () => {
            createPaymentInstrument.returns(
                {
                    paymentMethod: 'PayPal',
                    UUID: 'ee6d20764050743b97cab7e8f6',
                    custom: {
                        paypalOrderID: '8UU486582S253361B'
                    }
                }
            );
            getOrderDetails.returns({
                payer,
                purchase_units,
                err: {}
            });
            expect(processor.handle(basket, paymentInformation)).to.deep.equal({ 
                error: true,
                fieldErrors: [],
                serverErrors: ['Some server error']
             });
        });
        it('handle function returns an error object if isBillingAgreementID is try', () => {
            paymentInformation.billingForm.paypal.billingAgreementID.htmlValue = 'B-73122468JR707841D';
            createPaymentInstrument.returns(
                {
                    paymentMethod: 'PayPal',
                    UUID: 'ee6d20764050743b97cab7e8f6',
                    custom: {
                        paypalOrderID: '8UU486582S253361B'
                    }
                }
            );
            createBaFromForm.returns({
                baID: 'B-73122468JR707841D',
                default: true,
                email: 'I.VinogradovVN@gmail.com',
                saveToProfile: true
            });
            let shipping_address = {
                city: 'Servierville',
                country_code: 'US',
                line1: '473 Wiseman Street',
                phone: '408-922-3384',
                postal_code: '37862',
                recipient_name: 'Joy Gray',
                state: 'TN'
            };
            let billing_info = {
                billing_address: {
                    city: 'Pond',
                    country_code: 'US',
                    line1: '4866 Rodney Street',
                    postal_code: '63040',
                    state: 'MO'
                },
                email: 'I.VinogradovVN@gmail.com',
                first_name: 'Ivan',
                last_name: 'C Vinogradov',
                payer_id: 'QMG34HJTGX6NU',
                phone: '408-922-3384'
            };
            getBADetails.returns({
                shipping_address,
                billing_info
            });
            let result = {
                success: true,
                paymentInstrument: {
                    paymentMethod: 'PayPal',
                    UUID: 'ee6d20764050743b97cab7e8f6',
                    custom:
                    {
                        paypalOrderID: '8UU486582S253361B',
                        currentPaypalEmail: 'I.VinogradovVN@gmail.com',
                        PP_API_ActiveBillingAgreement:
                            '{"baID":"B-73122468JR707841D","default":true,"email":"I.VinogradovVN@gmail.com","saveToProfile":true}'
                    }
                },
                shippingAddress: {
                    city: 'Servierville',
                    country_code: 'US',
                    line1: '473 Wiseman Street',
                    phone: '408-922-3384',
                    postal_code: '37862',
                    recipient_name: 'Joy Gray',
                    state: 'TN'
                }
            };
            expect(processor.handle(basket, paymentInformation)).to.deep.equal(result);
        });
    });
    describe('authorize function', () => {
        let purchaseUnit = {
            amount: {},
            description: 'Long Sleeve Crew Neck',
            invoice_id: '00003603',
            shipping: {}
        };
        let order = {};
        let paymentInstrument = {};
        isPurchaseUnitChanged.returns(true);
        getPurchaseUnit.returns(purchaseUnit);
        
        before(() => {
            stub(dw.web.Resource, 'msg');
        });
        after(() => {
            dw.web.Resource.msg.restore();
        });
        it('should return object {error: true} if paymentInstrument or order is empty ', () => {
            dw.web.Resource.msg.returns('Some server error');
            expect(processor.authorize(order, paymentInstrument)).to.deep.equal({
                error: true,
                fieldErrors: [],
                serverErrors: ['Some server error']
            });
        });

        it('should return object {error: true} if paymentInstrument.paymentTransaction.amount.value is 0', () => {
            dw.web.Resource.msg.returns('Some server error');
            let paymentInstrument_2 = { paymentTransaction: { amount: { value: 0 } } };
            let order_2 = {
                status: {
                    displayValue: 'CREATED',
                    value: 0
                }
            };
            expect(processor.authorize(order_2, paymentInstrument_2)).to.deep.equal({
                error: true,
                fieldErrors: [],
                serverErrors: ['Some server error']
            });
        });
        before(() => {
            processor.__set__('createBAReqBody', () => {
                return {
                    payment_source: {
                        token: {
                            id: 'B-7J122468JR707841D',
                            type: 'BILLING_AGREEMENT'
                        }
                    }
                };
            });
            processor.__set__('getTransactionId', () => { return '7ML06956NU4656408'; });
            processor.__set__('getTransactionStatus', () => { return 'COMPLETED'; });
        });
        after(() => {
            processor.__ResetDependency__('createBAReqBody', () => { });
        });
        it('shoud return {authorized: true} if BA is active', () => {

            let paymentInstrument_3 = {
                paymentTransaction: { amount: { value: 47.23 } },
                custom: {
                    currentPayPalEmail: 'I.VinogradovVN@gmail.com',
                    PP_API_ActiveBillingAgreement: '{"baID":"B-73122468JR707841D","default":true,"email":"I.VinogradovVN@gmail.com","saveToProfile":true}'
                },
                getPaymentTransaction: () => {
                    return { setTransactionID: () => { } };
                }

            };
            let order_3 = {
                createdBy: 'Customer',
                currencyCode: 'USD',
                currentOrderNo: '00003605',
                customerEmail: 'I.VinogradovVN@gmail.com',
                customerLocaleID: 'en_US',
                customerName: 'Ivan C Vinofradov',
                status: {
                    displayValue: 'CREATED',
                    value: 0
                },
                custom: {}
            };
            let resp = {
                id: '7ML06956NU4656408',
                links: [
                    {
                        href: 'https://api.sandbox.paypal.com/v2/checkout/orders/7ML06956NU4656408',
                        method: 'GET',
                        rel: 'self'
                    },
                    {
                        href: 'https://www.sandbox.paypal.com/checkoutnow?token=7ML06956NU4656408',
                        method: 'GET',
                        rel: 'approve'
                    },
                    {
                        href: 'https://api.sandbox.paypal.com/v2/checkout/orders/7ML06956NU4656408',
                        method: 'PATCH',
                        rel: 'update'
                    },
                    {
                        href: 'https://api.sandbox.paypal.com/v2/checkout/orders/7ML06956NU4656408',
                        method: 'POST',
                        rel: 'authorize'
                    }
                ],
                status: 'CREATED'
            };
            createOrder.returns({ resp });
            createTransaction.returns({
                id: '7ML06956NU4656408',
                links: [],
                payer: {},
                purchase_units: [{
                    payments: [],
                    reference_id: 'default',
                    shipping: []
                }],
                status: 'COMPLETED'
            });

            expect(processor.authorize(order_3, paymentInstrument_3)).to.deep.equal({ authorized: true });
        });
    });
});
