'use strict';
/**
 * Description of the module and the logic
 * 
 * @module cartridge/scripts/jobs/myProductCategoryPathJob
 * @StepName myProductCategoryPathJob
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');


var run = function () {
    try {
        var ProductMgr = require('dw/catalog/ProductMgr');
        var Transaction = require('dw/system/Transaction');
        var allProducts = ProductMgr.queryAllSiteProducts();
        while (allProducts.hasNext()) {
            var productObj = allProducts.next();
            var variant = productObj.variant ? productObj.variationModel.master.getPrimaryCategory() :
                productObj.getPrimaryCategory();
            var Category = variant ? variant.ID : "";
            if (productObj) {
                Transaction.wrap(function () {
                    productObj.custom.CategoryPath = Category;
                });
            };
        }

    } catch (e) {
        Logger.error('myProductCategoryPathJob.js: Error occured in the run function' + e.message);
        var err = e.message;
        return new Status(Status.ERROR)
    }
    return new Status(Status.OK)
};

module.exports.run = run;