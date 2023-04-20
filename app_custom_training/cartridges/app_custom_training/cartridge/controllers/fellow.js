var server = require('server')

server.get('Show', function (req, res, next) {
    var productHelper = require('../scripts/helpers/productHelper');
    // var product = productHelper.getProductID(req.querystring.pid);
    res.render('display/tags', {
        ID: productHelper.getID(req.querystring.pid),
        Name: productHelper.getName(req.querystring.pid),
        color: productHelper.getColor(req.querystring.pid)
    });
    next();
});

module.exports = server.exports();