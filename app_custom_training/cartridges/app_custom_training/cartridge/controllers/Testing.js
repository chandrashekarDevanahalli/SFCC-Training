'use strict';


var server = require('server');
var i = 0;

server.get('Show', x, y, z, function (req, res, next) {
    res.json();
    next();
});

function x(req, res, next) {
    server.getRoute('Show').on('route:Step', function (req, res) {
        res.setViewData({
            Message1: "Hello " + (++i)
        });
    });
    next();
}

function y(req, res, next) {
    server.getRoute('Show').on('route:Step', function (req, res) {
        res.setViewData({
            Message2: "Hello " + (++i)
        });
    });
    next();
}

function z(req, res, next) {
    server.getRoute('Show').on('route:Step', function (req, res) {
        res.setViewData({
            Message3: "Hello " + (++i)
        });
    });
    next();
}

module.exports = server.exports();