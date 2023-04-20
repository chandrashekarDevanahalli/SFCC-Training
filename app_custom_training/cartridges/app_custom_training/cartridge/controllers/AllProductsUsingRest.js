'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var pid = req.querystring.pid;
    var productObj = ProductMgr.getProduct(pid);

    if (productObj) {
        var ATS = productObj.availabilityModel.inventoryRecord ?
            productObj.availabilityModel.inventoryRecord.ATS.value : 'NA';
        res.json({
            ATS: ATS
        })
    }
    next();
});
module.exports = server.exports();