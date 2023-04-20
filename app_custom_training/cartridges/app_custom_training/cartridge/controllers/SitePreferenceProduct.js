'use strict';


var server = require('server')
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');


server.get('Show', function (req, res, next) {
    // Get ProductID from SitePreference
    var productid = Site.getCurrent().getCustomPreferenceValue('productID')
    var List = new ArrayList();
    // Get Product object
    var product = ProductMgr.getProduct(productid)
    List.add(product)
    res.render('display/preference', {
        List: List
    })
    next();
});


module.exports = server.exports();