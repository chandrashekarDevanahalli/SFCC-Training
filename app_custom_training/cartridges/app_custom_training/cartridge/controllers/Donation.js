/**
 * Donation Controller
 * 
 * @module controllers/Donation
 */

'use strict';

var server = require('server');
var Logger = require('dw/system/Logger');
var csrf = require("app_storefront_base/cartridge/scripts/middleware/csrf")
var URLUtils = require('dw/web/URLUtils');

/**
 * To render the Donation Form
 */

server.get('Begin', function (req, res, next) {
    var Site = require('dw/system/Site');
    var donationForm = server.forms.getForm('donationForm');
    var sitePrefs = Site.getCurrent().getPreferences();
    var productID = sitePrefs.getCustom()['donationProductID'];


    res.render('donation/donationForm', {
        donationForm: donationForm,
        productID: productID,
        addToCartUrl: URLUtils.url('Cart-AddProduct')
    });
    next();
});

/**
 * To get data entered in form and save it in custom objects
 */

server.post('Result', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var donation = server.forms.getForm('donationForm');
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');
    var Site = require('dw/system/Site');
    var sitePrefs = Site.getCurrent().getPreferences();
    var donationProductID = sitePrefs.getCustom()['donationProductID'];
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var CartModel = require('*/cartridge/models/cart');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var data = req.form;

    var quantity = 1;
    var childProducts = null;
    var options = null;
    var productLineItem;

    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var allProductLineItems = currentBasket.getAllProductLineItems().iterator();
    while (allProductLineItems.hasNext()) {
        productLineItem = allProductLineItems.next();
        if (productLineItem.productID == donationProductID) {
            Transaction.wrap(function () {
                currentBasket.removeProductLineItem(productLineItem);
            });
            break;
        }
    }



    try {
        Transaction.wrap(function () {
            var result = cartHelper.addProductToCart(
                currentBasket,
                donationProductID,
                quantity,
                childProducts,
                options
            );

            var productLineItems = currentBasket.getAllProductLineItems(donationProductID);
            productLineItems[0].custom.donationEmail = donation.email.value;
            productLineItems[0].custom.donationFirstName = donation.firstName.value;
            productLineItems[0].custom.donationLastName = donation.lastName.value;
            productLineItems[0].custom.donationAmount = donation.amount.value;
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

    } catch (error) {
        var e = error.message;
        var err;
    }


    var cartModel = new CartModel(currentBasket);
    var reportingURL = URLUtils.url('ReportingEvent-MiniCart').toString();
    var redirectUrl = URLUtils.url('Cart-Show').toString();
    res.json({
        message: "ThANKS For Donating Product",
        reportingURL: reportingURL,
        cartModel: cartModel,
        redirectUrl: redirectUrl
    });
    next();
})

module.exports = server.exports();