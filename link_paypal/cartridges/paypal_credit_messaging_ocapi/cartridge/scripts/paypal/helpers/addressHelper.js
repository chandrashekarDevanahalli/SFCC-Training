'use strict';

var addressHelper = {};

/**
 * Creating Billing Agreement shipping_address
 * To create a billing agreement token, customer shipping_address needed
 * @param {string} shippingAddress - current customer shipping address
 * @returns {Object} object - BA filled shipping address
 */
addressHelper.getBAShippingAddress = function (shippingAddress) {
    return {
        line1: shippingAddress.getAddress1(),
        city: shippingAddress.getCity(),
        state: shippingAddress.getStateCode(),
        postal_code: shippingAddress.getPostalCode(),
        country_code: shippingAddress.getCountryCode().getValue(),
        recipient_name: shippingAddress.getFullName()
    };
};

/**
 * Creates shipping address
 * @param {Object} shippingAddress - user's shipping address
 * @returns {Object} with created shipping address
 */
addressHelper.createShippingAddress = function (shippingAddress) {
    return {
        name: {
            full_name: shippingAddress.fullName
        },
        address: {
            address_line_1: shippingAddress.address1,
            address_line_2: shippingAddress.address2,
            admin_area_1: shippingAddress.stateCode,
            admin_area_2: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            country_code: shippingAddress.countryCode.value.toUpperCase()
        }
    };
};

addressHelper.createBillingAddressFromOrder = function (payerObject) {
    var basket = require('dw/order/BasketMgr').getCurrentBasket();
    var fullName = payerObject.name;
    var address = payerObject.address;

    return {
        firstName: fullName.given_name,
        lastName: fullName.surname,
        countryCode: address.country_code,
        city: address.admin_area_2,
        address1: address.address_line_1,
        address2: address.address_line_2 || '',
        postalCode: address.postal_code,
        stateCode: address.admin_area_1,
        phone: payerObject.phone.phone_number.national_number,
        email: basket.customer.profile ? basket.customer.profile.email : payerObject.email_address
    };
};

module.exports = addressHelper;
