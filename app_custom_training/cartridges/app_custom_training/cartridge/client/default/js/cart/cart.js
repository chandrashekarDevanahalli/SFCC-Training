'use strict';

var base = require('base/cart/cart');
/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} data - AJAX response from the server
 */


module.exports = {

    updateCartTotals: function (data) {
        $('.number-of-items').empty().append(data.resources.numberOfItems);
        $('.shipping-cost').empty().append(data.totals.totalShippingCost);
        $('.tax-total').empty().append(data.totals.totalTax);
        $('.donation-amount-value').empty().append(data.totals.roundoff.roundOffAmountWithCurrency)
        $('.grand-total').empty().append(data.totals.grandTotal);
        $('.sub-total').empty().append(data.totals.subTotal);
        $('.minicart-quantity').empty().append(data.numItems);
        $('.minicart-link').attr({
            'aria-label': data.resources.minicartCountOfItems,
            title: data.resources.minicartCountOfItems
        });
        if (data.totals.orderLevelDiscountTotal.value > 0) {
            $('.order-discount').removeClass('hide-order-discount');
            $('.order-discount-total').empty()
                .append('- ' + data.totals.orderLevelDiscountTotal.formatted);
        } else {
            $('.order-discount').addClass('hide-order-discount');
        }

        if (data.totals.shippingLevelDiscountTotal.value > 0) {
            $('.shipping-discount').removeClass('hide-shipping-discount');
            $('.shipping-discount-total').empty().append('- ' +
                data.totals.shippingLevelDiscountTotal.formatted);
        } else {
            $('.shipping-discount').addClass('hide-shipping-discount');
        }

        data.items.forEach(function (item) {
            if (data.totals.orderLevelDiscountTotal.value > 0) {
                $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
            }
            if (item.renderedPromotions) {
                $('.item-' + item.UUID).empty().append(item.renderedPromotions);
            } else {
                $('.item-' + item.UUID).empty();
            }
            $('.uuid-' + item.UUID + ' .unit-price').empty().append(item.renderedPrice);
            $('.line-item-price-' + item.UUID + ' .unit-price').empty().append(item.renderedPrice);
            $('.item-total-' + item.UUID).empty().append(item.priceTotal.renderedPrice);
        });
    }
}


base.updateCartTotals = updateCartTotals();

module.exports = base;