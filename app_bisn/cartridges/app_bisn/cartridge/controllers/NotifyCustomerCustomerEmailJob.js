'use strict'

/**
 * @NotifyCustomerCustomerEmailJob
 *@ job to send email customers if that product is back in stock 
 */

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Result = require('dw/svc/Result');
var Transaction = require('dw/system/Transaction');


var run = function (args) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var notifyModule = require('*/cartridge/models/notifyCustomEmail');
    var ArrayList = require('dw/util/ArrayList');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    try {
        var allCustomObjects = CustomObjectMgr.getAllCustomObjects('NotifyMe')
        while (allCustomObjects.hasNext()) {
            var productArrayList = new ArrayList();
            var customObject = allCustomObjects.next()
            var emailAddress = customObject.custom.emailAddress;
            var productList = (customObject.custom.productIDs);
            var productIDs = []
            productList.forEach(function (item) {
                var product = ProductMgr.getProduct(item);
                var productName = product.getName();
                //web Service to check the Availability of ATS
                var svc = LocalServiceRegistry.createService('app_custom_training.http.allsiteproducts.get', {
                    createRequest: function (svc, params) {
                        svc = svc.setRequestMethod('GET');
                        var url = svc.getURL();
                        url += '?pid=' + params.pid;
                        svc = svc.setURL(url);
                        return "";
                    },
                    parseResponse: function (svc, responseObject) {
                        return responseObject;
                    }
                });

                var pid = item
                var result = svc.call({
                    pid: pid
                });
                var resultObj = JSON.parse(result.object.text)
                var ATS = resultObj.ATS;
                //parameter minimumstock configured from jobs
                if (ATS > args.minimumstock) {
                    productArrayList.push({
                        pid: item,
                        productName: productName
                    });
                } else {
                    productIDs.push(pid);
                    //updating custom object once the product is in stock if no product is available in stock 
                    if (customObject) {
                        if (productIDs.length > 0) {
                            Transaction.wrap(function () {
                                customObject.custom.productIDs = new ArrayList(productIDs);
                            });
                        } else {
                            Transaction.wrap(function () {
                                CustomObjectMgr.remove(customObject)
                            });
                        }
                    }

                }
            });
            //Sending Mail to customer
            notifyModule.sendMail(emailAddress, productArrayList)
            Logger.info("notifyCustomerEmailjob.js:Email sent Successfully")
        }

    } catch (error) {
        var err = error.message;
        Logger.error('Error Occured :' + error.message)
    }
}

module.exports.run = run;