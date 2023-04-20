'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
var StoreMgr = require('dw/catalog/StoreMgr');

/**
 * validates that the product line items exist, are online, and have available inventory.
 * @param {dw.order.Basket} basket - The current user's basket
 * @returns {Object} an error object
 */
function validateProducts(basket) {
    var result = {
        error: false,
        hasInventory: true
    };
    var productLineItems = basket.productLineItems;

    collections.forEach(productLineItems, function (item) {
        if (item.product === null || !item.product.online) {
            result.error = true;
            return;
        }

        if (Object.hasOwnProperty.call(item.custom, 'fromStoreId') &&
            item.custom.fromStoreId) {
            var store = StoreMgr.getStore(item.custom.fromStoreId);
            var storeInventory = ProductInventoryMgr.getInventoryList(store.custom.inventoryListId);

            result.hasInventory = result.hasInventory &&
                (storeInventory.getRecord(item.productID) &&
                    storeInventory.getRecord(item.productID).ATS.value >= item.quantityValue);
        } else {
            var availabilityLevels = item.product.availabilityModel
                .getAvailabilityLevels(item.quantityValue);
            result.hasInventory = result.hasInventory &&
                (availabilityLevels.notAvailable.value === 0);
        }
        // if (result.hasInventory) {
        //     var customInventory = require('*/cartridge/scripts/helpers/customInventoryCheck/customInventoryCheckHelper');
        //     var checkCustomInventory = customInventory.validateCustomInventoryProducts(item.quantity.value, item.productID);
        //     result = checkCustomInventory;
        // }
    });

    return result;
}

/**
 * Validates coupons
 * @param {dw.order.Basket} basket - The current user's basket
 * @returns {Object} an error object
 */
function validateCoupons(basket) {
    var invalidCouponLineItem = collections.find(basket.couponLineItems, function (couponLineItem) {
        return !couponLineItem.valid;
    });

    return {
        error: !!invalidCouponLineItem
    };
}

base = {
    validateProducts: validateProducts,
    validateCoupons: validateCoupons,
    validateShipments: COHelpers.ensureValidShipments
};

module.exports = base;