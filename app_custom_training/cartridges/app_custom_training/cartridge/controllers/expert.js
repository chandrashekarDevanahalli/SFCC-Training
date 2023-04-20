'use strict'


var server = require('server')
var ProductMgr = require('dw/catalog/ProductMgr');
var Product = require('dw/catalog/Product');
var CatalogMgr = require('dw/catalog/CatalogMgr');

server.get('Show', function(req, res, next){
    var products = ProductMgr;
    res.render('display/experts')
    next();
});
module.exports = server.exports();
