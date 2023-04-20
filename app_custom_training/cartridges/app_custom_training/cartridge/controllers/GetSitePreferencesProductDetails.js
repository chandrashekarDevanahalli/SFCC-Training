'use strict';

var server = require('server');
var Site = require('dw/system/Site');
var ArrayList = require('dw/util/ArrayList');

server.get('Show', function (req, res, next) {
    //Require Getproducthelper function
    var Product = require('../scripts/helpers/GetproductHelper');
    var productids = Site.current.getCustomPreferenceValue('ProductIDs');
    var productidList = new ArrayList();
    for (let i = 0; i < productids.length; i++) {
        //Create object using constructor function
        var productObj = new Product(productids[i]);
        productidList.add(productObj)
    }
    res.render('display/listProducts', {
        productDetails: productidList
    });
    next();
});

module.exports = server.exports();