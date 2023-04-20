'use strict';

var server = require('server');
var Product = require('dw/catalog/Product');
var Site = require('dw/system/Site');
var Catalog = require('dw/catalog/Catalog');
var ProductMgr = require('dw/catalog/ProductMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var ArrayList = require('dw/util/ArrayList');
var array = new ArrayList();

server.get('Show', function (req, res, next) {

    let x = 100;
    x = 100;
    //const x = 100;
    const y = 100;
    y = 200;
    //const y = 100;
    var array = new ArrayList();
    //var customal = CustomObjectMgr.getCustomObject('email')
    var customall = CustomObjectMgr.getAllCustomObjects('email')
    while (customall.hasNext()) {
        var ct = customall.next()
        array.push(ct.custom.productIDs)
    }

    var qqw = customall.next();
    var qq = customall.asList();
    var qqq = qq.get(0);
    var customerAddress = customer.addressBook.preferredAddress;
    var customerAddresses = customer.addressBook.addresses;
    var d3 = Catalog;
    var d2 = Product;
    var a1 = JSON;
    var a = customer.activeData;
    var f = customer.anonymous;
    var d = customer.CDPData;
    var s = customer;
    var v = customer.externalProfiles;
    var d = customer.globalPartyID;
    var k = customer.orderHistory;
    var q = customer.note;
    var t = customer.ID;
    var w = Object.defineProperty;
    res.render('display/tester', {
        data: customerAddresses
    });
    next();
});

module.exports = server.exports();