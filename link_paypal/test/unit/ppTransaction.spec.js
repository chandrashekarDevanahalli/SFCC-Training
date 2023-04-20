/* eslint-disable no-underscore-dangle */
const { ppTransactionPath } = require('./path');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const { stub } = require('sinon');

require('dw-api-mock/demandware-globals');
require('babel-register')({
    plugins: ['babel-plugin-rewire']
});

const isExpiredHonorPeriod = stub();
const formatedDate = stub();
const ppTransaction = proxyquire(ppTransactionPath, {
    'dw/value/Money': dw.value.Money,
    '*/cartridge/scripts/paypal/bmPaypalHelper': {
        isExpiredHonorPeriod,
        formatedDate },
    '*/cartridge/scripts/util/paypalConstants': {
        INTENT_CAPTURE: 'CAPTURE',
        STATUS_COMPLETED: 'COMPLETED'
    }
});

describe('ppTransaction file', () => {
    describe('getTaxAndShippingAmount', () => {
        const getTaxAndShippingAmount = ppTransaction.__get__('getTaxAndShippingAmount');
        const returnValue = 5;
        let amountBreakdown;
        let order;
        let isCustomer;

        afterEach(() => {
            amountBreakdown = undefined;
            order = undefined;
            isCustomer = undefined;
        });

        it('if amountBreakdown is true', () => {
            amountBreakdown = {
                shipping: { value: returnValue },
                tax_total: { value: returnValue }
            };
            expect(getTaxAndShippingAmount(amountBreakdown)).to.deep.equal({
                shippingAmount: returnValue,
                taxAmount: returnValue
            });
        });
        it('if amountBreakdown is false and isCustomerOrder is false', () => {
            order = {
                shippingTotalPrice: {
                    value: returnValue
                },
                totalTax: {
                    value: returnValue
                }
            };
            expect(getTaxAndShippingAmount(amountBreakdown, isCustomer, order)).to.deep.equal({
                shippingAmount: returnValue,
                taxAmount: returnValue
            });
        });
        it('if amountBreakdown is false and isCustomerOrder is true', () => {
            expect(getTaxAndShippingAmount(amountBreakdown, {}, order)).to.deep.equal({
                shippingAmount: 0,
                taxAmount: 0
            });
        });
    });

    describe('getTaxAndShippingAmount', () => {
        const getTransactionId = ppTransaction.__get__('getTransactionId');
        let payments;
        let transactionIdFromReq;
        let fixId = '***';

        afterEach(() => {
            payments = {};
            transactionIdFromReq = '';
        });

        it('if payments.captures and transactionIdFromReq are not empty should return transactionIdFromReq', () => {
            payments = {
                captures: [{ id: fixId }],
                authorizations: [{ id: fixId }]
            };
            transactionIdFromReq = 'transactionIdFromReq';
            expect(getTransactionId(payments, transactionIdFromReq)).to.deep.equal(transactionIdFromReq);
        });
        it('if payments.captures or transactionIdFromReq are empty and payments.authorizations is not than should return payments.authorizations[0].id', () => {
            payments = {
                authorizations: [{ id: fixId }]
            };
            transactionIdFromReq = 'transactionIdFromReq';
            expect(getTransactionId(payments, transactionIdFromReq)).to.deep.equal(fixId);
        });
        it('if payments.captures, transactionIdFromReq and payments.authorizations are empty should be returned payments.captures[0].id', () => {
            payments = {
                captures: [{ id: fixId }]
            };
            expect(getTransactionId(payments, transactionIdFromReq)).to.deep.equal(fixId);
        });
    });
    describe('TransactionModel', function () {
        let transaction;
        let order;
        let isCustomOrder = false;
        
        before(() => {
            Array.filter = function (a, b) {
                return Array.prototype.filter.call(a, b);
            };
            request.httpParameterMap = {
                transactionId: { stringValue: '7F0816103A703023N' }
            };
            transaction = {
                id: '7DV33677FE740241X',
                intent: 'AUTHORIZE',
                payer: {
                    name: {
                        given_name: 'Ivan',
                        surname: 'C Vinogradov'
                    },
                    email_address: 'I.VinogradovVN@gmail.com'
                },
                purchase_units: [{
                    amount: {
                        breakdown: {
                            discount: {
                                currency_code: 'USD',
                                value: 0.00
                            },
                            handling: {
                                currency_code: 'USD',
                                value: 0.00
                            },
                            insurance: {
                                currency_code: 'USD',
                                value: 0.00
                            },
                            shipping: {
                                currency_code: 'USD',
                                value: 5.99
                            },
                            tax_total: {
                                currency_code: 'USD',
                                value: 3.75
                            }
                        },
                        value: 78.74,
                        currency_code: 'USD'
                    },
                    invoice_id: '00002818',
                    payments: {
                        captures: [{
                            status: 'COMPLETED',
                            id: '7F0816103A703023N',
                            amount: {
                                currency_code: 'USD',
                                value: 1000
                            }
                        }],
                        authorizations: [{
                            amount: [{}],
                            create_time: '',
                            expiration_time: '',
                            id: '75P818536D991905L',
                            invoice_id: '00002818',
                            links: [],
                            seller_protection: [],
                            status: 'COMPLETED',
                            update_time: ''
                        }]
                    }
                }],
                create_time: '',
                update_time: '2021-12-02T08:28:41Z'
            };
            order = {
                getCustom: () => { }
            };
        });
        it('TransactionModel shoud be equal expectedTransactionModelObject', function () {
            formatedDate.returns('12/02/21 8:28 am');
            isExpiredHonorPeriod.returns(false);
            let ppTransactionObject = new ppTransaction(transaction, order, isCustomOrder);
            const expectedTransactionModelObject = {
                id: '7DV33677FE740241X',
                intent: 'AUTHORIZE',
                payer: {
                    name: {
                        given_name: 'Ivan',
                        surname: 'C Vinogradov'
                    },
                    email_address: 'I.VinogradovVN@gmail.com'
                },
                purchase_units: [
                    {
                        amount: {
                            breakdown: {
                                discount: {
                                    currency_code: 'USD',
                                    value: 0
                                },
                                handling: {
                                    currency_code: 'USD',
                                    value: 0
                                },
                                insurance: {
                                    currency_code: 'USD',
                                    value: 0
                                },
                                shipping: {
                                    currency_code: 'USD',
                                    value: 5.99
                                },
                                tax_total: {
                                    currency_code: 'USD',
                                    value: 3.75
                                }
                            },
                            value: 78.74,
                            currency_code: 'USD'
                        },
                        invoice_id: '00002818',
                        payments: {
                            captures: [
                                {
                                    status: 'COMPLETED',
                                    id: '7F0816103A703023N',
                                    amount: {
                                        currency_code: 'USD',
                                        value: 1000
                                    }
                                }
                            ],
                            authorizations: [
                                {
                                    amount: [
                                        {}
                                    ],
                                    create_time: '',
                                    expiration_time: '',
                                    id: '75P818536D991905L',
                                    invoice_id: '00002818',
                                    links: [],
                                    seller_protection: [],
                                    status: 'COMPLETED',
                                    update_time: ''
                                }
                            ]
                        }
                    }
                ],
                create_time: '',
                update_time: '2021-12-02T08:28:41Z',
                isCaptureButtonAllowed: false,
                capturedAmount: 1000,
                captureID: '7F0816103A703023N',
                refundedAmount: 0,
                restRefountAmount: 1000,
                captures: [
                    {
                        'status': 'COMPLETED',
                        'id': '7F0816103A703023N',
                        'amount': {
                            'currency_code': 'USD',
                            'value': 1000
                        }
                    }
                ],
                purchaseUnits: {
                    'amount': {
                        'breakdown': {
                            'discount': {
                                'currency_code': 'USD',
                                'value': 0
                            },
                            'handling': {
                                'currency_code': 'USD',
                                'value': 0
                            },
                            'insurance': {
                                'currency_code': 'USD',
                                'value': 0
                            },
                            'shipping': {
                                'currency_code': 'USD',
                                'value': 5.99
                            },
                            'tax_total': {
                                'currency_code': 'USD',
                                'value': 3.75
                            }
                        },
                        'value': 78.74,
                        'currency_code': 'USD'
                    },
                    'invoice_id': '00002818',
                    'payments': {
                        'captures': [
                            {
                                'status': 'COMPLETED',
                                'id': '7F0816103A703023N',
                                'amount': {
                                    'currency_code': 'USD',
                                    'value': 1000
                                }
                            }
                        ],
                        'authorizations': [
                            {
                                'amount': [
                                    {}
                                ],
                                'create_time': '',
                                'expiration_time': '',
                                'id': '75P818536D991905L',
                                'invoice_id': '00002818',
                                'links': [],
                                'seller_protection': [],
                                'status': 'COMPLETED',
                                'update_time': ''
                            }
                        ]
                    }
                },
                firstname: 'Ivan',
                lastname: 'C Vinogradov',
                email: 'I.VinogradovVN@gmail.com',
                amt: 78.74,
                currencycode: 'USD',
                shippingAmount: 5.99,
                taxAmount: 3.75,
                invnum: '00002818',
                mainTransactionId: '7F0816103A703023N',
                transactionid: '7F0816103A703023N',
                authorizationId: '75P818536D991905L',
                order: order,
                orderTimeCreated: '',
                orderTimeUpdated: '12/02/21 8:28 am',
                paymentstatus: 'COMPLETED',
                isCaptured: false,
                isExpiredHonorPeriod: false,
                isCustomOrder: false
            };
            expect(ppTransactionObject).to.deep.equal(expectedTransactionModelObject);
        });
    });
});
