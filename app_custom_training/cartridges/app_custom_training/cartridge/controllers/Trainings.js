'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var Mymodule = require('../models/myModule')
    res.render('display/myModule', {
        Mymodule: Mymodule
    });
    res.setViewData({
        a: 200
    });
    var a = {};
    Object.defineProperty(a, 'c', {
        value: 100,
        enumerable: false,
        configurable: true,
        writable: true
    });
    res.json({
            text: a.c
        }),

        //a = 200;
        res.getViewData();

    for (let i = 0; i > 0; i++) {
        res.json();
    }

    next();
});

module.exports = server.exports();