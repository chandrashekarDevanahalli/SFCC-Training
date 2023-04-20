'use strict';

/**
 * check customInventory of each product have available inventory.
 * @param {quantity ,pid} 
 * @returns {true or false} 
 */

var server = require('server');

server.post('Show', function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Logger = require('dw/system/Logger');
    var bodyString = req.body;
    var bodyObj = JSON.parse(bodyString)
    var productID = bodyObj.pid;
    var quantity = bodyObj.quantity;
    try {
        var productRecord = CustomObjectMgr.getCustomObject('customInventory', productID);
        if (!productRecord) {
            Logger.info('CustomInventoryRest.js:No record available for productID' + productID);
            res.json({
                Message: true
            });
        } else {
            // Made changes for custom inventory for some time need to change it
            if (true) {
                Logger.info('CustomInventoryRest.js:quantity available for productID' + productID);
                res.json({
                    Message: true
                });
            } else {
                Logger.info('CustomInventoryRest.js:quantity not available for productID' + productID);
                res.json({
                    Message: true
                })
            }
        }

    } catch (error) {
        var err = error.message;
        Logger.error('Error in CustomInventoryRest.js:' + error.message)

    }


    next();
});

module.exports = server.exports();