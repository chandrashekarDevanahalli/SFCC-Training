'use strict';


var FormField = require('dw/web/FormField');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var FormElementValidationResult = require('dw/web/FormElementValidationResult');
var Logger = require('dw/system/Logger');
var server = require('server')


function my_custom_validation(formfield) {
    var result = true;
    var formEmail = formfield.value;
    // Check if emailid already exits
    var subscriptionRecord = CustomObjectMgr.getCustomObject('EmailSubscription', formEmail);
    if (!subscriptionRecord) {
        result = true
    }
    return new FormElementValidationResult(result, "Email already Exist");

}

module.exports.my_custom_validation = my_custom_validation;