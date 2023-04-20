'use strict';

const page = module.superModule;
const server = require('server');

const {
    addEnableFundigParamPaylater
} = require('*/cartridge/scripts/helpers/enableFundingHelper');

server.extend(page);

server.append('Begin', function (_, res, next) {
    var paypal = res.getViewData().paypal;
    var sdkUrl = paypal.sdkUrl;

    paypal.sdkUrl = addEnableFundigParamPaylater(sdkUrl);

    res.setViewData({
        paypal: paypal
    });

    next();
});

module.exports = server.exports();
