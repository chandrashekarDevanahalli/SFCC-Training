'use strict';

const server = require('server');

const Transaction = require('dw/system/Transaction');
const HookMgr = require('dw/system/HookMgr');
const PaymentMgr = require('dw/order/PaymentMgr');
const Money = require('dw/value/Money');
const BasketMgr = require('dw/order/BasketMgr');
const OrderMgr = require('dw/order/OrderMgr');
const Order = require('dw/order/Order');
const Status = require('dw/system/Status');
const URLUtils = require('dw/web/URLUtils');
const Resource = require('dw/web/Resource');

const {
    getOrderByOrderNo,
    isPurchaseUnitChanged,
    getPurchaseUnit,
    getBARestData,
    hasOnlyGiftCertificates,
    getTransactionId,
    getTransactionStatus
} = require('*/cartridge/scripts/paypal/helpers/paypalHelper');

const {
    validateExpiredTransaction,
    parseBody,
    validateProcessor,
    removeNonPaypalPayment,
    validateHandleHook,
    validateGiftCertificateAmount,
    validateConnectWithPaypalUrl
} = require('*/cartridge/scripts/paypal/middleware');

const userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');

const {
    updateOrderDetails,
    getBillingAgreementToken,
    createBillingAgreement,
    getOrderDetails,
    cancelBillingAgreement,
    exchangeAuthCodeForAccessToken,
    getPaypalCustomerInfo
} = require('*/cartridge/scripts/paypal/paypalApi');

const {
    encodeString,
    createErrorMsg,
    createErrorLog,
    createDebugLog,
    createAccountSDKUrl,
    getUrls
} = require('*/cartridge/scripts/paypal/paypalUtils');

const {
    createPaymentInstrument,
    getPaypalPaymentInstrument,
    removePaypalPaymentInstrument,
    removePayPalPaymentInstrumentByEmail
} = require('*/cartridge/scripts/paypal/helpers/paymentInstrumentHelper');

const {
    updateOrderBillingAddress,
    updateOrderShippingAddress,
    updateBAShippingAddress
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');

const {
    getFullNameFromPayPal,
    getAddressObjectFromPayPal
} = require('*/cartridge/scripts/paypal/helpers/loginPayPalAddressHelper');

const {
    authorizationAndCaptureWhId,
    paypalPaymentMethodId,
    automaticPmAddingEnabled,
    PP_CWPP_Agent_Login,
    PP_CWPP_Agent_Password
} = require('*/cartridge/config/paypalPreferences');

const COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

const BillingAgreementModel = require('*/cartridge/models/billingAgreement');
const CustomerModel = require('*/cartridge/models/customer');

const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');

server.get('GetPurchaseUnit', server.middleware.https, function (req, res, next) {
    var {
        currentBasket
    } = BasketMgr;
    var cartFlow = req.querystring.isCartFlow === 'true';
    var purchaseUnits = [getPurchaseUnit(currentBasket, cartFlow)];

    session.privacy.orderDataHash = encodeString(purchaseUnits[0]);

    res.json({
        purchase_units: purchaseUnits
    });
    next();
});

server.use('UpdateOrderDetails', server.middleware.https, validateExpiredTransaction, function (req, res, next) {
    var {
        currentBasket
    } = BasketMgr;
    var isCartFlow = req.querystring.isCartFlow === 'true';
    var purchaseUnit = getPurchaseUnit(currentBasket, isCartFlow);
    var isUpdateRequired = isPurchaseUnitChanged(purchaseUnit);
    var paymentInstrument = getPaypalPaymentInstrument(currentBasket);

    if (paymentInstrument.custom.PP_API_ActiveBillingAgreement) {
        if (paymentInstrument.paymentTransaction.amount.value.toString() !== purchaseUnit.amount.value) {
            var newAmount = new Money(purchaseUnit.amount.value, purchaseUnit.amount.currency_code);

            Transaction.wrap(function () {
                paymentInstrument.paymentTransaction.setAmount(newAmount);
            });
        }
        res.json({});

        return next();
    } else if (isUpdateRequired) {
        if (purchaseUnit.amount.value === '0') {
            res.setStatusCode(500);
            res.json({
                errorMsg: createErrorMsg('zeroamount')
            });

            return next();
        }
        var {
            err
        } = updateOrderDetails(paymentInstrument, purchaseUnit);
        if (err) {
            res.setStatusCode(500);
            res.json({
                errorMsg: err
            });

            return next();
        }
        session.privacy.orderDataHash = encodeString(purchaseUnit);
        res.json({});

        return next();
    }

    return '';
});

server.post('ReturnFromCart',
    server.middleware.https,
    removeNonPaypalPayment,
    validateProcessor,
    validateHandleHook,
    validateGiftCertificateAmount,
    function (req, res, next) {
        var {
            currentBasket
        } = BasketMgr;
        var paymentFormResult;
        var paymentForm = server.forms.getForm('billing');
        var processorId = PaymentMgr.getPaymentMethod(paypalPaymentMethodId).getPaymentProcessor().ID.toLowerCase();

        if (HookMgr.hasHook('app.payment.form.processor.' + processorId)) {
            paymentFormResult = HookMgr.callHook('app.payment.form.processor.' + processorId,
                'processForm',
                req,
                paymentForm, {}
            );
        } else {
            paymentFormResult = HookMgr.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (!paymentFormResult || paymentFormResult.error) {
            res.setStatusCode(500);
            res.print(createErrorMsg());

            return next();
        }

        var processorHandle = HookMgr.callHook('app.payment.processor.' + processorId,
            'Handle',
            currentBasket,
            paymentFormResult.viewData.paymentInformation
        );

        if (!processorHandle || !processorHandle.success) {
            res.setStatusCode(500);
            res.print(createErrorMsg());

            return next();
        }

        var {
            shippingAddress
        } = processorHandle;
        if (processorHandle.paymentInstrument.custom.paypalOrderID) {
            if (!hasOnlyGiftCertificates(currentBasket)) {
                updateOrderShippingAddress(currentBasket, shippingAddress);
            }
        } else {
            updateBAShippingAddress(currentBasket, shippingAddress);
        }

        res.json();

        return next();
    });

server.get('GetBillingAgreementToken', server.middleware.https, function (req, res, next) {
    var isCartFlow = req.querystring.isCartFlow === 'true';
    var isSkipShippingAddress = req.querystring.isSkipShippingAddress === 'true';
    var {
        billingAgreementToken,
        err
    } = getBillingAgreementToken(getBARestData(isCartFlow, isSkipShippingAddress));
    if (err) {
        res.setStatusCode(500);
        res.print(err);

        return next();
    }

    res.json({
        token: billingAgreementToken
    });

    return next();
});

server.post('CreateBillingAgreement', server.middleware.https, parseBody,
    function (_, res, next) {
        var response = createBillingAgreement(res.parsedBody.billingToken);
        if (response.err) {
            res.setStatusCode(500);
            res.print(response.err);

            return next();
        }

        res.json(response);

        return next();
    });

server.use('RemoveBillingAgreement', server.middleware.https, function (req, res, next) {
    const billingAgreementModel = new BillingAgreementModel();

    const baEmail = req.querystring.billingAgreementEmail;
    const billingAgreement = billingAgreementModel.getBillingAgreementByEmail(baEmail);
    billingAgreementModel.removeBillingAgreement(billingAgreement);
    cancelBillingAgreement(billingAgreement.baID);

    if (BasketMgr.currentBasket) {
        removePayPalPaymentInstrumentByEmail(BasketMgr.currentBasket, baEmail);
    }

    res.json({});
    return next();
});

server.post('SaveBillingAgreement', server.middleware.https, parseBody,
    function (req, res, next) {
        var billingAgreementModel = new BillingAgreementModel();
        var baData = res.parsedBody;
        const isAutomaticPmAddingFlow = baData && baData.isAutomaticPmAddingFlow;
        const customerInstance = new CustomerModel(customer);

        try {
            if (baData) {
                var savedBA = billingAgreementModel.getBillingAgreements();
                var isAccountAlreadyExist = billingAgreementModel.isAccountAlreadyExist(baData.email);
                if (!isAccountAlreadyExist) {
                    if (empty(savedBA)) {
                        baData.default = true;
                    }
                    baData.saveToProfile = true;
                    delete baData.isAutomaticPmAddingFlow;
                    billingAgreementModel.saveBillingAgreement(baData);

                    if (isAutomaticPmAddingFlow) {
                        Transaction.wrap(function () {
                            customerInstance.addFlashMessage(
                                Resource.msg('paypal.account.paymentmethodadded.notification.msg', 'locale', null),
                                CustomerModel.FLASH_MESSAGE_SUCCESS
                            );
                        });
                    }
                }
            }
        } catch (err) {
            if (isAutomaticPmAddingFlow) {
                Transaction.wrap(function () {
                    customerInstance.addFlashMessage(
                        Resource.msg('paypal.account.paymentmethodnotadded.notification.msg', 'locale', null),
                        CustomerModel.FLASH_MESSAGE_DANGER
                    );
                });
            }

            createErrorLog(err);
        }

        res.json({});
        return next();
    });

server.get('GetOrderDetails', server.middleware.https, function (req, res, next) {
    var orderId = req.querystring.orderId;
    var response = getOrderDetails({
        custom: {
            paypalOrderID: orderId
        }
    });

    if (response.err) {
        res.setStatusCode(500);
        res.print(response.err);

        return next();
    }

    res.json(response);

    return next();
});

server.post('FinishLpmOrder', server.middleware.https, parseBody, function (_, res, next) {
    var {
        details,
        lpmName
    } = res.parsedBody;
    var {
        currentBasket
    } = BasketMgr;
    var paymentInstrument = createPaymentInstrument(currentBasket, 'PayPal');

    const transactionId = getTransactionId(details);

    Transaction.wrap(function () {
        paymentInstrument.custom.paypalOrderID = details.id;
        paymentInstrument.custom.currentPaypalEmail = details.payer.email_address;
        paymentInstrument.custom.paymentId = lpmName;
        paymentInstrument.getPaymentTransaction().setTransactionID(transactionId);
        paymentInstrument.custom.paypalPaymentStatus = getTransactionStatus(details);
    });

    // Creates a new order.
    var order = COHelpers.createOrder(currentBasket);

    if (!order) {
        res.setStatusCode(500);
        res.print(createErrorMsg());

        return next();
    }

    // Update billing address.
    updateOrderBillingAddress(currentBasket, details.payer);

    // Places the order.
    try {
        Transaction.begin();
        var placeOrderStatus = OrderMgr.placeOrder(order);

        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);
        order.setExportStatus(Order.EXPORT_STATUS_READY);
        order.custom.paypalPaymentMethod = 'express';
        order.custom.PP_API_TransactionID = transactionId;
        Transaction.commit();
    } catch (e) {
        Transaction.wrap(function () {
            OrderMgr.failOrder(order, true);
        });
        createErrorLog(e);
        res.setStatusCode(500);
        res.print(e.message);

        return next();
    }

    // Clean up basket.
    removePaypalPaymentInstrument(currentBasket);

    res.json({
        redirectUrl: URLUtils.https('Order-Confirm', 'orderID', order.orderNo, 'orderToken', order.orderToken).toString()
    });

    return next();
});

server.get('ConnectWithPaypal',
    validateConnectWithPaypalUrl,
    function (req, res, next) {
        try {
            // Gets the access token according to the authentification code
            const accessToken = exchangeAuthCodeForAccessToken(request.httpParameterMap.code.value);
            // Gets the Paypal customer information according to the access token
            const payPalCustomerInfo = getPaypalCustomerInfo(accessToken);
            const errorMessage = Resource.msg('error.oauth.login.failure', 'login', null);

            if (!payPalCustomerInfo || !payPalCustomerInfo.emails || !payPalCustomerInfo.name || !payPalCustomerInfo.address) {
                throw errorMessage;
            }

            const customerEmail = payPalCustomerInfo.emails.shift().value;
            let newlyRegisteredUser = false;
            let customerInstance = CustomerModel.get(customerEmail);

            if (!customerInstance) {
                Transaction.wrap(function () {
                    customerInstance = CustomerModel.create(customerEmail);
                    customerInstance.setEmail(customerEmail);

                    const [firstName, lastName] = getFullNameFromPayPal(payPalCustomerInfo);

                    customerInstance.setFirstName(firstName);
                    customerInstance.setLastName(lastName);

                    customerInstance.setPhone(Resource.msg('paypal.account.address.phonenumber.notprovided', 'locale', null));

                    customerInstance.sendRegistrationEmail();
                    newlyRegisteredUser = true;
                });
            }

            const externalProfileExist = CustomerModel.externalProfileExist(customerEmail);

            if (externalProfileExist) {
                Transaction.wrap(function () {
                    customerInstance.addFlashMessage(
                        Resource.msg('account.legacy', 'notifications', null),
                        CustomerModel.FLASH_MESSAGE_INFO
                    );
                });
            }

            const AgentUserMgr = require('dw/customer/AgentUserMgr');
            const requestLocale = request.getLocale();
            const guestBasket = BasketMgr.getCurrentBasket();

            if (AgentUserMgr.loginAgentUser(PP_CWPP_Agent_Login, PP_CWPP_Agent_Password).error) {
                throw errorMessage;
            }

            if (AgentUserMgr.loginOnBehalfOfCustomer(customerInstance.dw).error) {
                throw errorMessage;
            }

            if (!customerInstance.getPreferredLocale()) {
                request.setLocale(requestLocale);
            }

            if (guestBasket) {
                Transaction.wrap(function () {
                    customerInstance.restoreBasket(guestBasket);
                });
            }

            const accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
            // req.querystring.state - oAuth reentry endpoint(Account - 1 or Checkout - 2)
            const oauthReentryEndpoint = req.querystring.state;
            const redirectURL = accountHelpers.getLoginRedirectURL(oauthReentryEndpoint, req.session.privacyCache, newlyRegisteredUser);

            // Automatic payment method adding flow
            if (automaticPmAddingEnabled && customerInstance.isEnabledFeatureAPMA()) {
                const urlArgs = [
                    paypalConstants.ENDPOINT_PAYPAL_APMA,
                    'redirectURL', redirectURL,
                    'addressObject', encodeURIComponent(JSON.stringify(getAddressObjectFromPayPal(payPalCustomerInfo)))
                ];

                res.redirect(URLUtils.url.apply(null, urlArgs));
            // Default flow
            } else {
                res.redirect(redirectURL);
            }
        } catch (err) {
            res.render('/error', {
                message: err
            });

            createErrorLog(err);
        }

        return next();
    });

server.post('PaymentAuthorizationAndCaptureHook', function (req, res, next) {
    var AuthorizationAndCaptureWhMgr = require('*/cartridge/models/authorizationAndCaptureWhMgr');
    var authorizationAndCaptureWhMgr;
    var responseObject = {};

    try {
        var whEvent = JSON.parse(request.httpParameterMap.requestBodyAsString);
        var eventType = whEvent.event_type;
        var eventResource = whEvent.resource;
        authorizationAndCaptureWhMgr = new AuthorizationAndCaptureWhMgr();

        // Cheks if endpoint received an appropriate event
        var isApproppriateEventType = authorizationAndCaptureWhMgr.isApproppriateEventType(eventType);

        // Throws an error and stop procced the rest of logic
        if (!isApproppriateEventType) {
            authorizationAndCaptureWhMgr.logEventError(eventType, this.name);
        }

        // Verify webhook event notifications
        var verifiedResponse = authorizationAndCaptureWhMgr.verifyWhSignature(whEvent, request.httpHeaders, authorizationAndCaptureWhId);
        var verificationStatus = verifiedResponse.verification_status;

        if (verificationStatus === paypalConstants.STATUS_SUCCESS) {
            var orderNo = eventResource.invoice_id;
            var paymentStatus = eventResource.status;

            if (!orderNo || !paymentStatus) {
                throw Resource.msg('paypal.webhook.order.details.error', 'paypalerrors', null);
            }

            // Gets order needed to update payment status
            var order = getOrderByOrderNo(orderNo);

            if (!order) {
                var orderErrorMsg = Resource.msg('paypal.webhook.order.notexist.error', 'paypalerrors', null);
                createDebugLog(orderErrorMsg);

                responseObject.error = orderErrorMsg;
                responseObject.success = false;
                res.json(responseObject);

                return next();
            }

            // Handles different WebHook scenarios in depends of received webHook event
            switch (eventType) {
                case paypalConstants.PAYMENT_AUTHORIZATION_VOIDED:
                    authorizationAndCaptureWhMgr.voidPaymentOnDwSide(order, paymentStatus);
                    break;
                case paypalConstants.PAYMENT_CAPTURE_REFUNDED:
                    authorizationAndCaptureWhMgr.refundPaymentOnDwSide(order, paypalConstants.PAYMENT_STATUS_REFUNDED);
                    break;
                case paypalConstants.PAYMENT_CAPTURE_COMPLETED:
                    authorizationAndCaptureWhMgr.completePaymentOnDwSide(order, paymentStatus);
                    break;
                default:
                    break;
            }
        } else {
            throw Resource.msgf('paypal.webhook.verified.error', 'paypalerrors', null, verificationStatus);
        }
    } catch (err) {
        responseObject.error = err;
        responseObject.success = false;

        res.json(responseObject);

        createErrorLog(err);

        return next();
    }

    res.setStatusCode(200);
    responseObject.success = true;
    res.json(responseObject);

    return next();
});

server.get('APMA', server.middleware.https, userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        if (!req.querystring.redirectURL || !req.querystring.addressObject) {
            res.redirect(URLUtils.url(paypalConstants.ENDPOINT_HOME_SHOW));
            return next();
        }

        const customerInstance = new CustomerModel(customer);
        const hasBillingAgreement = customerInstance.hasBillingAgreement();
        const addressObjectString = decodeURIComponent(req.querystring.addressObject);
        const hasAddress = customerInstance.hasAddress(JSON.parse(addressObjectString));

        if (!customerInstance.isEnabledFeatureAPMA() || (hasBillingAgreement && hasAddress)) {
            res.redirect(req.querystring.redirectURL);
            return next();
        }

        Transaction.wrap(function () {
            customerInstance.disableFeatureAPMA();
        });

        let addingStage = paypalConstants.APMA_STAGE_COMPLETE;

        if (hasBillingAgreement) {
            addingStage = paypalConstants.APMA_STAGE_ADDRESS;
        }

        if (hasAddress) {
            addingStage = paypalConstants.APMA_STAGE_ACCOUNT;
        }

        res.render('paypal/automaticPaymentMethodAdding/automaticPaymentMethodAdding', {
            paypal: {
                sdkUrl: createAccountSDKUrl(),
                paypalUrls: JSON.stringify(getUrls())
            },
            addingStage: addingStage,
            addressObject: addressObjectString,
            redirectURL: req.querystring.redirectURL
        });

        return next();
    });

/**
 * Uses only for 'Automatic payment method adding' flow due Connect with PayPal button
 */
server.post('SavePaypalDefaultAddress', server.middleware.https, parseBody,
    function (req, res, next) {
        const customerInstance = new CustomerModel(customer);

        try {
            // Creates a customer address from the address provided by 'Connect with PayPal' feature
            Transaction.wrap(function () {
                customerInstance.addAddress(res.parsedBody.addressObject);
            });

            const StringUtils = require('dw/util/StringUtils');
            const resourceContext = res.parsedBody.isAccountPage ? 'account' : 'checkout';

            Transaction.wrap(function () {
                customerInstance.addFlashMessage(
                    Resource.msg(StringUtils.format('paypal.{0}.shippingaddressadded.notification.msg', resourceContext), 'locale', null),
                    CustomerModel.FLASH_MESSAGE_SUCCESS
                );
            });
        } catch (err) {
            Transaction.wrap(function () {
                customerInstance.addFlashMessage(
                    Resource.msg('paypal.account.shippingaddressnotadded.notification.msg', 'locale', null),
                    CustomerModel.FLASH_MESSAGE_DANGER
                );
            });

            createErrorLog(err);
        }

        res.json({});

        return next();
    }
);

module.exports = server.exports();
