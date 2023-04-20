'use strict';

var server = require('server');
var Site = require('dw/system/Site');

server.get('Show', function (req, res, next) {
    // Require helper
    var helper = require('../scripts/helpers/SitePreferencehelper');
    //Get helper function
    var productids = helper.getProductID()
    //Send parameter to getProductList from productids
    var productDetails = helper.getProductList(productids)
    res.render('display/listProdutDetails', {
        productDetails: productDetails
    })
    next();
});

module.exports = server.exports();