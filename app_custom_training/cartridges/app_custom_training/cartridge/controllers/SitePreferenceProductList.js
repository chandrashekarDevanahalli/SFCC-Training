'use strict';

/**
 * if No Product with ID XYZ not found in Site Preference 
 * Get the http status code 404
 * 
 */

var server = require('server')
var ArrayList = require('dw/util/ArrayList');
var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');

server.get('Show', function (req, res, next) {
    var productidList = new ArrayList();
    // Get ProductID from SitePreference
    var productids = Site.getCurrent().getCustomPreferenceValue('ProductIDs');
    var renderTemplate = 'display/preferenceList';
    var context = {
        List: ''
    }
    // Check productIDs are available in SitePreference, if not present render error msg
    if (!productids.length) {
        res.render('display/sitePreferenceError');
        return next();
    } else {
        for (var i = 0; i < productids.length; i++) {
            var product = ProductMgr.getProduct(productids[i]);
            // Get product object
            if (product != null) {
                productidList.add(product)
                context.List = productidList;
            } else {
                // if given product is wrong render error msg
                renderTemplate = 'display/sitePreferenceError'
                context.List = productids[i]
                break;
            }
        }
        res.render(renderTemplate, context);
        next();
    }
});
module.exports = server.exports();