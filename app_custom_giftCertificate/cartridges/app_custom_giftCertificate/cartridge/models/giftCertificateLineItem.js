'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var currentBasket = BasketMgr.getCurrentBasket();


function giftCertificateLineItem() {
    var gcItems = [];
    if (currentBasket) {
        var gcLineItems = currentBasket.getGiftCertificateLineItems().toArray();


        for (let i = 0; i < gcLineItems.length; i++) {
            gcItems.push({
                UUID: gcLineItems[i].UUID,
                lineItemText: gcLineItems[i].lineItemText,
                senderName: gcLineItems[i].senderName,
                recipientName: gcLineItems[i].recipientName,
                recipientEmail: gcLineItems[i].recipientEmail,
                price: gcLineItems[i].price
            })
        }
    }

    return gcItems;

}

function giftCertificateLineItems() {
    this.gcItems = giftCertificateLineItem();
}

module.exports = giftCertificateLineItems;