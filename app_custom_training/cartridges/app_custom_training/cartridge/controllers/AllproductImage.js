'use strict';

var server = require('server');

var BasketMgr = require('dw/order/BasketMgr');
var productMgr = require('dw/catalog/ProductMgr');
var Product = require('dw/catalog/Product');
const CatalogMgr = require('dw/catalog/CatalogMgr');

server.get('Show', function (req, res, next) {
    //var products = Product.getAllProductLinks();
    
// Get the product manager for the default catalog
    //const productMgr = CatalogMgr.getDefaultCatalog().getProductMgr();

// Query all products
    const products = productMgr.queryAllProducts();
    var prod = ProductMgr.queryAllProducts();
    res.json({})
    next()
});

module.exports = server.exports();