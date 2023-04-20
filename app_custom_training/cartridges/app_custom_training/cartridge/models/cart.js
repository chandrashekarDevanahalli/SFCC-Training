'use strict';

var base = module.superModule;
var BasketMgr = require('dw/order/BasketMgr');
var currentBasket = BasketMgr.getCurrentBasket();

function CartModel(basket) {
    var Site = require('dw/system/Site');
    base.call(this, basket);
    this.donationProductID = donationProductID;

}


function donationProductID() {
    var Site = require('dw/system/Site');
    var donationProductID = Site.getCurrent().getCustomPreferenceValue("donation");
    return donationProductID;
}


module.exports = CartModel;