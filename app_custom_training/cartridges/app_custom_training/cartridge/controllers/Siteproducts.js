'use strict';

var server = require('server')
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');


server.get('Show', function (req, res, next) {
    // Get ProductID from SitePreference
    var productids = Site.current.getCustomPreferenceValue('ProductIDs');
    var productList = new ArrayList();
    // Check productIDs are available in SitePreference, if not present render error msg
    if (empty(productids)) {
        res.render('display/errorNotFound')
    } else {
        for (var i = 0; i < productids.length; i++) {
            var products = ProductMgr.getProduct(productids[i])
            // Get product object
            if (products != null) {
                productList
            } else {
                res.render('display/error', {
                    List: productids[i]
                });
                break;
            }
            res.render('display/preference', {
                List: productList
            });
            productList.add(products);
        }
    }
    next();
});

module.exports = server.exports();