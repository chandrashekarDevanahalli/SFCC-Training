'use strict';

function getProductID(ID){
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Product = ProductMgr.getProduct(ID);
    return Product.ID;

}

function getProductName(ID){
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Product = ProductMgr.getProduct(ID);
    return Product.name;

}


function getProductcolor(ID){
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Product = ProductMgr.getProduct(ID);
    return Product.custom.color;

}
module.exports= {
    getID : getProductID,
    getName : getProductName,
    getColor : getProductcolor

};