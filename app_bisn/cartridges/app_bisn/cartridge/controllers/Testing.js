'use strict';

var server = require('server')
var ArrayList = require('dw/util/ArrayList');

server.get('Show', function (req, res, next) {
    var largestElementinArray = require('*/cartridge/scripts/practice/LargestElementinArray');
    var arr = [2, 4, 4, 5, 2];
    var n = 5;
    var a = typeof (arr)
    largestElementinArray.largest(arr, n);
    res.json({
        al: "message"
    })
    next();
});

module.exports = server.exports();