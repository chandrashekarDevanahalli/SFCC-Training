'use strict';

const page = module.superModule;
const server = require('server');

const Resource = require('dw/web/Resource');

const {
    validateWhetherPaypalEnabled
} = require('*/cartridge/scripts/paypal/middleware');

const {
    billingAgreementEnabled
} = require('*/cartridge/config/paypalPreferences');

const {
    getLIPPCustomerAddress,
    savePhoneNumberInLIPPAddress
} = require('*/cartridge/scripts/paypal/helpers/loginPayPalAddressHelper');

const BillingAgreementModel = require('*/cartridge/models/billingAgreement');

const {
    createAccountSDKUrl,
    getUrls
} = require('*/cartridge/scripts/paypal/paypalUtils');

server.extend(page);

server.append('Show', validateWhetherPaypalEnabled,
    function (req, res, next) {
        var billingAgreementModel = new BillingAgreementModel();
        var savedBA = billingAgreementModel.getBillingAgreements(true);
        var lippAddress = customer.addressBook ? getLIPPCustomerAddress() : null;

        // Updates a customer address from 'Connect with paypal feature' (LIPP-login-PayPal) with phone number
        // as 'Not Provided' in case if phone === null
        if (lippAddress && lippAddress.phone === null) {
            savePhoneNumberInLIPPAddress(lippAddress, Resource.msg('paypal.account.address.phonenumber.notprovided', 'locale', null));

            res.viewData.account.addresses.forEach(function (address) {
                if (address.ID === lippAddress.ID) {
                    address.phone = lippAddress.phone;
                }
            });

            if (res.viewData.account.preferredAddress.address.ID === lippAddress.ID) {
                res.viewData.account.preferredAddress.address.phone = lippAddress.phone;
            }
        }

        res.setViewData({
            paypal: {
                savedBA: savedBA,
                billingAgreementEnabled: billingAgreementEnabled,
                isBaLimitReached: billingAgreementModel.isBaLimitReached(),
                sdkUrl: createAccountSDKUrl(),
                paypalUrls: JSON.stringify(getUrls())
            }
        });

        next();
    }
);

server.append(
    'Login',
    server.middleware.https,
    function (req, res, next) {
        const Transaction = require('dw/system/Transaction');
        const CustomerModel = require('*/cartridge/models/customer');

        if (customer.authenticated && customer.registered) {
            const externalProfileExist = CustomerModel.externalProfileExist(customer.profile.email);

            if (externalProfileExist) {
                const customerInstance = new CustomerModel(customer);

                Transaction.wrap(function () {
                    customerInstance.addFlashMessage(
                        Resource.msg('account.legacy', 'notifications', null),
                        CustomerModel.FLASH_MESSAGE_INFO
                    );
                });
            }
        }

        next();
    }
);

module.exports = server.exports();
