'use strict';


var server = require('server');
var FormField = require('dw/web/FormField');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Forms = require('dw/web/Forms');

server.get('Show', function (req, res, next) {
    var form = server.forms.getForm('emailSubscription');
    var subscriptionRecord = CustomObjectMgr.getAllCustomObjects('EmailSubscription');
    res.json();
    next();
});

module.exports = server.exports();