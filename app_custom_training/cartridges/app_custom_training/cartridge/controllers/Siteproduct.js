'use strict';

/**
 * @namespace SiteProduct
 */
var server = require('server')
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');


server.get('Show', function (req, res, next) {
    var productids = Site.current.getCustomPreferenceValue('ProductIDs');
    var productList = new ArrayList();
    var productLists = new ArrayList();
    if (empty(productids)) {
        res.render('display/errorNotFound')
    } else {
        for (var i = 0; i <= productids.length - 1; i++) {
            var products = ProductMgr.getProduct(productids[i])
            var inter = productids[i]
            if (products != null) {
                productList.add(products);
            } else {
                productLists.add(inter);
            }
        }
    }
    res.render('display/training', {
        available: productList,
        dummy: productLists
    });
    next();
});

module.exports = server.exports();