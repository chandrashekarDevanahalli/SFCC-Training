'use strict';

var server = require('server')
var ArrayList = require('dw/util/ArrayList');

server.get('Show', function (req, res, next) {
    var message = "message from controller";
    var al = new ArrayList();
    al.add(10);
    al.add(20);
    al.add(30);
    al.add(30);
    var obj = {};
    obj.List = al;
    console.log(al)
    res.json({
        al: message
    })
    next();
});

module.exports = server.exports();