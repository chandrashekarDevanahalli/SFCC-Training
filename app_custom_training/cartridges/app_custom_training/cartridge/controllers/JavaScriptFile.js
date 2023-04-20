'use strict';


var server = require('server');

server.get('Show', function (req, res, next) {
    res.redirect('https://google.com')
    next();
});
module.exports = server.exports();

//     X: 100
// }
// res.setViewData(obj)
// next();
// },
// function (req, res, next) {

// res.getViewData()
// next();
// });
// function ric(x) {
//     this.msg = x
//     return this;

//     var message = 'run'
//     var helper = require('../scripts/helpers/toCheck')
//     var u = helper.fun
//     var y = helper.gun
//     var t = new u()
//     var r = y.jun()
//     //var a = 10;
//     let a = [1, 3, 5];
//     a = [3, 4, 5]
//     var obj = {};
//     var p = ric(a);
//     var obj2 = ric.call(message, 'hello');
//     res.json({
//         text: p
// }