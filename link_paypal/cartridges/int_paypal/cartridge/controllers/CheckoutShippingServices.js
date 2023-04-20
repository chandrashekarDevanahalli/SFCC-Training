'use strict';

const page = module.superModule;
const server = require('server');
const {
    isLIPPAddressUsedOnCheckoutPage,
    savePhoneNumberInLIPPAddress,
    getLIPPCustomerAddress
} = require('*/cartridge/scripts/paypal/helpers/loginPayPalAddressHelper');

server.extend(page);

server.append('SubmitShipping', function (req, res, next) {
    var httpParameterMap = req.httpParameterMap;
    var newPhoneNumber = httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_phone').value;

    // Updates a customer address from 'Connect with paypal feature' (LIPP-login-PayPal) with phone number
    if (newPhoneNumber) {
        var lippAddress = customer.addressBook ? getLIPPCustomerAddress() : null;
        var isLippAddressUsed = lippAddress !== null && isLIPPAddressUsedOnCheckoutPage(lippAddress, httpParameterMap);

        if (isLippAddressUsed && lippAddress.phone === null) {
            savePhoneNumberInLIPPAddress(lippAddress, newPhoneNumber);
        }
    }

    next();
});

module.exports = server.exports();
