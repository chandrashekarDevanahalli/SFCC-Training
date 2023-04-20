'use strict';

var Site = require('dw/system/Site');
var sitePrefs = Site.getCurrent().getPreferences();

var base = module.superModule;

module.exports = function (object, apiProduct, type) {
    base.call(this, object, apiProduct, type);
    Object.defineProperty(object, 'isEligibleForPersonalization', {
        enumerable: true,
        value: apiProduct.custom.isEligibleForPersonalization
    });

    Object.defineProperty(object, 'isDonationProduct', {
        enumerable: true,
        value: apiProduct.ID === sitePrefs.getCustom()["donationProductID"] ? true : false
    });
};