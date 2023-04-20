'use strict';
var server = require('server');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
server.get('Save', function (req, res, next) {
    var webRef = webreferences2.BankCustomerService;

    res.json()
    next();
});
module.exports = server.exports();




var server = require('server');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
server.get('Show', function (req, res, next) {
    var calculatorService = LocalServiceRegistry.createService('app_custom_training.soap.calculator.add', {
        initServiceClient: function (svc) {
            var webRef = webreferences2.calculator;
            var serviceClient = webRef.getDefaultService();
            return serviceClient;
        },
        createRequest: function (svc, params) {
            return {}
        },
        execute: function (svc, request) {
            return svc.getServiceClient().add(50, 60);
        },
        parseResponse: function (svc, response) {
            return response;
        }
    });

    var result = calculatorService.call();
    if (result.isOk()) {
        res.json({
            result: result.object
        });
    } else {
        res.json({
            status: result.getStatus()
        });
    }
    next();
});

module.exports = server.exports();