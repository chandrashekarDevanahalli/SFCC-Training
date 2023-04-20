'use strict';

var base = module.superModule;
var BasketMgr = require('dw/order/BasketMgr');
var currentBasket = BasketMgr.getCurrentBasket();
var GiftCertificateLineItemsModel = require('*/cartridge/models/giftCertificateLineItem');

function CartModel(basket) {
    var Site = require('dw/system/Site');
    base.call(this, basket);
    var giftCertificateLineItemsModel = new GiftCertificateLineItemsModel();
    this.gcItems = giftCertificateLineItemsModel.gcItems;

}

module.exports = CartModel;