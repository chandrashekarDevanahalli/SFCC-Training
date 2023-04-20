'use strict';
/**
 * @names 
 */
var server = require('server');

server.get('Show', function (req, res, next) {
    var obj = {};
    Object.defineProperty(obj, 'c', {
        value: 300,
        enumerable: true,
        configurable: true,
        writable: true
    });
    Object.keys(obj);
    obj.c = 500
    let a = 600
    a = 030
    // let x = 100;
    // x = 100;
    // let x = 100;
    // const y = 100;
    // y = 200;
    // const y = 100;
    var custom = req.currentCustomer;
    var cc = customer;


    res.render('display/training')
    res.json({
        text: obj.c,
        sa: a
    });
    next();

});

module.exports = server.exports();