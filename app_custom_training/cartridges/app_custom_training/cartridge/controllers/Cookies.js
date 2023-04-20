'use strict';

/**
 * 
 * @namespace{cookie}
 */

var server = require('server')
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');
var Cookie = require('dw/web/Cookie');

server.get('Show', function (req, res, next) {
    var productids = request.httpCookies['productID1'];
    // Check there is a name with productIDs
    if (!productids) {
        return next(new Error('There is no cookie with that name'));
    } else {
        // Get Cookie Value
        var cookieval = productids.value
        // Split the cookie values
        var cookievalue = cookieval.split(',');
        var renderTemplate = 'display/cookies';
        var context = {
            List: ''
        }
        var productList = new ArrayList();
        for (var i = 0; i < cookievalue.length; i++) {
            var product = ProductMgr.getProduct(cookievalue[i])
            // Check if the given productID is valid or not
            if (empty(product)) {
                renderTemplate = 'display/cookieError'
                productList = cookievalue[i]
                break;
            }
            productList.add(product)
        }
        context.List = productList;
        res.render(renderTemplate, context);
        next();
    }
});

module.exports = server.exports();