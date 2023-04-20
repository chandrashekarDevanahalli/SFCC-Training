'use strict';


var server = require('server');
var Cookie = require('dw/web/Cookie');
var ProductMgr = require('dw/catalog/ProductMgr');
var ArrayList = require('dw/util/ArrayList');

server.get('Show', function (req, res, next) {
    //Read the query string from the URL
    var cookiename = req.querystring.cn;
    // Get the cookie value from the cookiename
    var ProductsFromCookie = request.httpCookies[cookiename].getValue();
    // Get the product object based on the productID
    var product = ProductMgr.getProduct(ProductsFromCookie)

    res.render('display/cookietwo', {
        ProductsFromCookie: ProductsFromCookie,
        product: product
    });
    next();

});
module.exports = server.exports();