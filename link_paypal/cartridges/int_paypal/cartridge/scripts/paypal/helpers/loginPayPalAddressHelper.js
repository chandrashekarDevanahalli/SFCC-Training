'use strict';

const Transaction = require('dw/system/Transaction');
const Resource = require('dw/web/Resource');

const {
    getShippingAddressFromHttpParameterMap
} = require('*/cartridge/scripts/paypal/helpers/addressHelper');

var loginPayPalAddressHelper = {};

/**
 * Returns an object from provided by Login PayPal (dw.customer.CustomerAddress) customer address
 * @param {dw.customer.CustomerAddress} lippAddress An address provided by Login PayPal
 * @returns {Object} Object from dw.customer.CustomerAddress
 */
function getLIPPCustomerAddressAsObject(lippAddress) {
    return {
        address1: lippAddress.address1,
        city: lippAddress.city,
        countryCode: lippAddress.countryCode.value,
        firstName: lippAddress.firstName,
        lastName: lippAddress.lastName,
        postalCode: lippAddress.postalCode,
        stateCode: lippAddress.stateCode,
        phone: lippAddress.phone
    };
}

/**
 * Retrieves the first and the last name of the PayPal customer.
 * @param {Object} payPalCustomerInfo Information about the PayPal customer.
 * @returns {Array} The first and the last name of the customer.
 */
loginPayPalAddressHelper.getFullNameFromPayPal = function (payPalCustomerInfo) {
    const [firstName, middleName, lastName] = payPalCustomerInfo.name.trim().split(/\s+/);

    return [firstName, lastName || middleName];
};

/**
 * Retrieves the address information of the PayPal customer.
 * @param {Object} payPalCustomerInfo Information about the PayPal customer.
 * @returns {Object} Address information of the customer.
 */
loginPayPalAddressHelper.getAddressObjectFromPayPal = function (payPalCustomerInfo) {
    const paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
    const postalCode = payPalCustomerInfo.address.postal_code;
    const addressID = [paypalConstants.LOGIN_PAYPAL, postalCode].join(' - ');
    const [firstName, lastName] = this.getFullNameFromPayPal(payPalCustomerInfo);

    return {
        id: addressID,
        address1: payPalCustomerInfo.address.street_address,
        city: payPalCustomerInfo.address.locality,
        countryCode: payPalCustomerInfo.address.country,
        firstName: firstName,
        lastName: lastName,
        postalCode: postalCode,
        stateCode: payPalCustomerInfo.address.region,
        phone: Resource.msg('paypal.account.address.phonenumber.notprovided', 'locale', null)
    };
};

/**
 * Returns a customer address provided by Login PayPal feature
 * @returns {dw.customer.CustomerAddress} A customer address
 */
loginPayPalAddressHelper.getLIPPCustomerAddress = function () {
    var paypalConstants = require('*/cartridge/scripts/util/paypalConstants');
    var lippCustomerAddress = customer.addressBook.getAddresses().toArray().find(function (address) {
        return address.ID.includes(paypalConstants.LOGIN_PAYPAL);
    });

    return lippCustomerAddress || null;
};

/**
 * Save a phone number to the address provided by login PayPal feature
 * @param {dw.customer.CustomerAddress} lippAddress A customer address provided by Login PayPal feature
 * @param {string} phoneNumber Phone number
 */
loginPayPalAddressHelper.savePhoneNumberInLIPPAddress = function (lippAddress, phoneNumber) {
    Transaction.wrap(function () {
        lippAddress.setPhone(phoneNumber);
    });
};

/**
 * Whether is used an address provided by login PayPal feature on Checkout page
 * @param {dw.customer.CustomerAddress} lippAddress A customer address provided by Login PayPal feature
 * @param {dw.sweb.HttpParameterMap} httpParameterMap A map of HTTP parameters.
 * @returns {boolean} true/false
 */
loginPayPalAddressHelper.isLIPPAddressUsedOnCheckoutPage = function (lippAddress, httpParameterMap) {
    var lippCustomerAddress = getLIPPCustomerAddressAsObject(lippAddress);
    var currentShippingAddress = getShippingAddressFromHttpParameterMap(httpParameterMap);
    var currentShippingAddresskeysArray = Object.keys(currentShippingAddress);
    var elementNotMatch = currentShippingAddresskeysArray.find(function (key) {
        return lippCustomerAddress[key] !== currentShippingAddress[key];
    });

    return !elementNotMatch;
};

module.exports = loginPayPalAddressHelper;
