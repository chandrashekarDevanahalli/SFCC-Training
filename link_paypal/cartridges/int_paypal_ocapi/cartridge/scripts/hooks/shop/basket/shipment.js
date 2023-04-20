'use string';

const {
    validateOrderAddress,
    validateRequestStringValue
} = require('~/cartridge/scripts/paypal/helpers/validationHelper');

/**
 * Validates shipping address and shipping method of the basket shipment
 * @param {Shipment} shipmentInfo Document representing a shipment
 * @param {dw.order.Shipment} shipment Represents an order shipment
 * @returns {Object} Represent a valid or a not valid result with an error message
 */
function validateShipment(shipmentInfo, shipment) {
    const Resource = require('dw/web/Resource');
    const shippingMethodIdFromRequest = shipmentInfo.shippingMethod && shipmentInfo.shippingMethod.id;
    const shippingAddressFromRequest = shipmentInfo.shippingAddress;

    let resultObject = {
        valid: true
    };

    // Case when a shipping address in not set to the basket and request does not contain a shipping address
    if (!shippingAddressFromRequest && shipment.shippingAddress === null) {
        resultObject.valid = false;
        resultObject.message = Resource.msg('paypal.ocapi.error.shipment.shippingAddress.isrequired', 'locale', null);
    // Case when a shipping method is not set to the basket and request does not contain a shipping method
    } else if (!shippingMethodIdFromRequest && !shipment.shippingMethod) {
        resultObject.valid = false;
        resultObject.message = Resource.msg('paypal.ocapi.error.shipment.shippingMethod.isrequired', 'locale', null);
    // Validates whether shipping method or shipping address values from request are valid
    } else if ((shippingAddressFromRequest && !validateOrderAddress(shippingAddressFromRequest)) ||
        (shippingMethodIdFromRequest && !validateRequestStringValue(shippingMethodIdFromRequest))) {
        resultObject.valid = false;
        resultObject.message = Resource.msg('paypal.ocapi.error.shipment.not.valid', 'locale', null);
    }

    return resultObject;
}

/**
 * The function is called before changing of a shipment for a basket
 * The Hook validates shipment elelemts that is required for creating order with Paypal payment instrument
 * @param {dw.order.Basket} basket A current basket
 * @param {dw.order.Shipment} shipment Represents an order shipment
 * @param {Shipment} shipmentInfo Document representing a shipment
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePATCH(basket, shipment, shipmentInfo) {
    const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
    const validateShipmentResult = validateShipment(shipmentInfo, shipment);

    if (!validateShipmentResult.valid) {
        return hooksHelper.createErrorStatus(validateShipmentResult.message);
    }
}

exports.beforePATCH = beforePATCH;
