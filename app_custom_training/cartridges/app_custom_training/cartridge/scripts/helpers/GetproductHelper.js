'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');

var Product = function (pid) {
    var product = ProductMgr.getProduct(pid)
    if (product)
        this.product = product;
    this.ID = function (product) {
        return this.product.ID;
    };
    this.getName = function (product) {
        return this.product.getName();
    };
    this.getBrand = function (product) {
        return this.product.getBrand();
    };
}


module.exports = Product;