'use strict';


var server = require('server');
// Require helper function
var userAuthentication = require('../scripts/helpers/userLoginHelper')
// check customer authentication
server.get('Show', userAuthentication.customerLogin)


module.exports = server.exports();