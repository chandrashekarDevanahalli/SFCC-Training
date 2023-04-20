'use strict';

/**
 *@onRequest {} The function is called by extension point extensionPointOnRequest.
                It is called when a storefront request was received from the client.
 *@return {status} Status.OK for success.
            Status.ERROR for error.
 *@onSession {} The function is called by extension point extensionPointOnSession.
                 It is called when a new storefront session was started.
 *@return {status} Status.OK for success.
            Status.ERROR for error.
 */

var Currency = require('dw/util/Currency');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');


function onSession() {
    session.custom.message = 'This is from onSession function Testing...'
    try {
        var getCookieValue = request.httpCookies['currencyCode'].getValue();
        var getCurrency = Currency.getCurrency(getCookieValue)
        if (getCookieVaue == getCurrency) {
            session.setCurrency(getCurrency);
        }
        return new Status(Status.OK)

    } catch (error) {
        var err = error.message;
        Logger.error('Failed to set currency' + error.message)
    }

}
module.exports.onSession = onSession;



function onRequest() {
    var currencyName = Currency.getCurrency('EUR')
    session.setCurrency(currencyName);
    var getCurrentSit = Site.getCurrent();

}

module.exports.onSession = onSession;
module.exports.onRequest = onRequest;