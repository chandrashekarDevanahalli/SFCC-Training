'use strict'

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Result = require('dw/svc/Result');


/**
 * validates that the product line items exist,and have available inventory 
 * In the custom Inventory.
 * @param {dw.order.Basket} basket - The current user's basket
 * @returns {Object} an error object
 */

function validateCustomInventoryProducts(quantity, pid) {
    var result = {
        error: false,
        hasInventory: true
    };


    var svc = LocalServiceRegistry.createService('app_custom_training.http.custominventoryproducts.get', {
        createRequest: function (svc, params) {
            svc = svc.setRequestMethod('POST');
            var payload = {};
            payload.quantity = params.quantity;
            payload.pid = params.pid;
            return JSON.stringify(payload);
        },
        parseResponse: function (svc, responseObject) {
            return responseObject;
        }
    });
    var result = svc.call({
        pid: pid,
        quantity: quantity
    });
    var resultObj = JSON.parse(result.object.text)
    var result = resultObj.Message;

    return result;

}

module.exports = {
    validateCustomInventoryProducts: validateCustomInventoryProducts
}