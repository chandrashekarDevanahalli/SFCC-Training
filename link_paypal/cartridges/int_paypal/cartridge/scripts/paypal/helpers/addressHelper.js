'use strict';

const Transaction = require('dw/system/Transaction');

/**
 * @param {dw.order.Basket} basket - current user's basket
 * @returns {void}
 */
function updateShippingMethodsList(basket) {
    const shippingHelper = require('*/cartridge/scripts/checkout/shippingHelpers');
    const basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    let shippingMethodID;
    const shipment = basket.defaultShipment;

    if (shipment.shippingMethod) {
        shippingMethodID = shipment.shippingMethod.ID;
    }

    shippingHelper.selectShippingMethod(shipment, shippingMethodID);

    basketCalculationHelpers.calculateTotals(basket);
}

const addressHelper = {};

/**
 * Returns Object with first, second, last names from a simple string person name
 *
 * @param {string} name Person Name
 * @returns {Object} person name Object
 */
addressHelper.createPersonNameObject = function (name) {
    var nameNoLongSpaces = name.trim().replace(/\s+/g, ' ').split(' ');
    var personNameObject = {
        firstName: null,
        lastName: null
    };

    if (nameNoLongSpaces.length === 1) {
        personNameObject.firstName = name;
    } else if (nameNoLongSpaces.length === 2) {
        personNameObject.firstName = nameNoLongSpaces[0];
        personNameObject.lastName = nameNoLongSpaces[1];
    } else {
        personNameObject.firstName = nameNoLongSpaces.slice(0, 2).join(' ');
        personNameObject.lastName = nameNoLongSpaces.slice(2).join(' ');
    }

    return personNameObject;
};


/**
 * Update Billing Address for order with order id
 * @param  {dw.order.Basket} basket - Current users's basket
 * @param  {Object} billingAddress user's billing address
 */
addressHelper.updateOrderBillingAddress = function (basket, billingAddress) {
    var {
        name,
        address,
        phone,
        email_address
    } = billingAddress;

    Transaction.wrap(function () {
        var billing = basket.getBillingAddress() || basket.createBillingAddress();
        billing.setFirstName(name.given_name || '');
        billing.setLastName(name.surname || '');
        billing.setCountryCode(address.country_code);
        billing.setCity(address.admin_area_2 || '');
        billing.setAddress1(address.address_line_1 || '');
        billing.setAddress2(address.address_line_2 || '');
        billing.setPostalCode(decodeURIComponent(address.postal_code) || '');
        billing.setStateCode(address.admin_area_1 || '');
        billing.setPhone(phone.phone_number.national_number || (billing.phone || ''));

        if (empty(basket.customerEmail)) {
            basket.setCustomerEmail(basket.customer.authenticated ?
                basket.customer.profile.email : email_address);
        }
    });
};

/**
 * Update Shipping Address for order with order id
 * @param  {dw.order.Basket} basket basket - Current users's basket
 * @param  {Object} shippingInfo - user's shipping address
 */
addressHelper.updateOrderShippingAddress = function (basket, shippingInfo) {
    let shipping;
    const fullShippingName = shippingInfo.shipping.name.full_name;
    const fullName = addressHelper.createPersonNameObject(fullShippingName);
    const shippingAddress = shippingInfo.shipping.address;

    Transaction.wrap(function () {
        shipping = basket.getDefaultShipment().getShippingAddress() || basket.getDefaultShipment().createShippingAddress();
        shipping.setCountryCode(shippingAddress.country_code);
        shipping.setCity(shippingAddress.admin_area_2 || '');
        shipping.setAddress1(shippingAddress.address_line_1 || '');
        shipping.setAddress2(shippingAddress.address_line_2 || '');
        shipping.setPostalCode(decodeURIComponent(shippingAddress.postal_code) || '');
        shipping.setStateCode(shippingAddress.admin_area_1 || '');
        shipping.setPhone(shippingInfo.phone.phone_number.national_number || '');

        if (!empty(fullName.firstName)) {
            shipping.setFirstName(fullName.firstName || '');
        }

        if (!empty(fullName.secondName)) {
            shipping.setSecondName(fullName.secondName || '');
        }

        if (!empty(fullName.lastName)) {
            shipping.setLastName(fullName.lastName || '');
        }

        updateShippingMethodsList(basket);
    });
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
            postal_code: decodeURIComponent(shippingAddress.postalCode),
            country_code: shippingAddress.countryCode.value.toUpperCase()
        }
    };
};

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
        postal_code: decodeURIComponent(shippingAddress.getPostalCode()),
        country_code: shippingAddress.getCountryCode().getValue(),
        recipient_name: shippingAddress.getFullName()
    };
};

/**
 * Update Billing Address for order with BA id
 * @param  {dw.order.Basket} basket - Current users's basket
 * @param  {Object} billingAddress user's billing address
 */
addressHelper.updateBABillingAddress = function (basket, billingAddress) {
    var {
        first_name,
        last_name,
        billing_address,
        phone,
        email
    } = billingAddress;

    Transaction.wrap(function () {
        var billing = basket.getBillingAddress() || basket.createBillingAddress();
        billing.setFirstName(first_name || '');
        billing.setLastName(last_name || '');
        billing.setCountryCode(billing_address.country_code);
        billing.setCity(billing_address.city || '');
        billing.setAddress1(billing_address.line1 || '');
        billing.setAddress2(billing_address.line2 || '');
        billing.setPostalCode(decodeURIComponent(billing_address.postal_code) || '');
        billing.setStateCode(billing_address.state || '');
        if (empty(billing.phone)) {
            billing.setPhone(phone || '');
        }
        if (empty(basket.customerEmail)) {
            basket.setCustomerEmail(basket.customer.authenticated ?
                basket.customer.profile.email : email);
        }
    });
};

/**
 * Update Shipping Address for order with BA id
 * @param  {dw.order.Basket} basket basket - Current users's basket
 * @param  {Object} shippingAddress - user's shipping address
 * @param  {Object} billingAddress user's billing address
 */
addressHelper.updateBAShippingAddress = function (basket, shippingAddress) {
    // phone taken from billing address in handle hook
    const {
        country_code,
        city,
        line1,
        line2,
        postal_code,
        state,
        recipient_name,
        phone
    } = shippingAddress;

    const fullName = addressHelper.createPersonNameObject(recipient_name);

    Transaction.wrap(function () {
        const shipping = basket.getDefaultShipment().getShippingAddress() || basket.getDefaultShipment().createShippingAddress();
        shipping.setCountryCode(country_code);
        shipping.setCity(city || '');
        shipping.setAddress1(line1 || '');
        shipping.setAddress2(line2 || '');
        shipping.setPostalCode(decodeURIComponent(postal_code) || '');
        shipping.setStateCode(state || '');
        shipping.setPhone(phone || '');

        if (!empty(fullName.firstName)) {
            shipping.setFirstName(fullName.firstName || '');
        }

        if (!empty(fullName.secondName)) {
            shipping.setSecondName(fullName.secondName || '');
        }

        if (!empty(fullName.lastName)) {
            shipping.setLastName(fullName.lastName || '');
        }

        updateShippingMethodsList(basket);
    });
};

/**
 * Returns shipping address object from provided HTTP parameter map with shippings fileds
 * @param {dw.sweb.HttpParameterMap} httpParameterMap A map of HTTP parameters.
 * @returns {Object} A Shipping address object
 */
addressHelper.getShippingAddressFromHttpParameterMap = function (httpParameterMap) {
    return {
        address1: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_address1').value,
        city: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_city').value,
        countryCode: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_country').value,
        firstName: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_firstName').value,
        lastName: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_lastName').value,
        postalCode: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_postalCode').value,
        stateCode: httpParameterMap.get('dwfrm_shipping_shippingAddress_addressFields_states_stateCode').value
    };
};

module.exports = addressHelper;
