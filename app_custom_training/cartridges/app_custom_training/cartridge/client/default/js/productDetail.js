'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    //processInclude(require('./product/detail'));
    processInclude(require('instorepickup/product/pdpInstoreInventory'));
    processInclude(require('instorepickup/product/details'));
    processInclude(require('wishlist/product/wishlist'));
});