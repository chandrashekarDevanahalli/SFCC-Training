'use strict';

var server = require('server')
server.extend(module.superModule);
server.append('Show', function (req, res, next) {
    var NotifyMeForm = server.forms.getForm('notifyMe');
    NotifyMeForm.clear();
    var productID = req.querystring.pid;

    res.setViewData({
        produtID: productID,
        NotifyMeForm: NotifyMeForm
    });
    next();
});

module.exports = server.exports();