'use strict';


function sendMail(emailAddress, productArrayList) {
    // call email helper function
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    //emailObj
    var emailObj = {};
    emailObj.cc = ['chandrudp58@gmail.com'];
    emailObj.to = ['Chandrashekar.devanahalli@merklecxm.com', emailAddress, 'chandrudp29@gmail.com'];
    emailObj.from = 'chandrudp29@gmail.com';
    emailObj.subject = 'Hurry!! Item back in stock';

    //template
    var template = 'display/notifyMeEmailTemplate';



    //context
    var context = {};
    context.emailAddress = emailAddress
    context.productArrayList = productArrayList


    // Send Email
    emailHelpers.send(emailObj, 'display/notifyMeEmailTemplate', context)
    Logger.info('Email sent successfully')
}
module.exports = {
    sendMail: sendMail
}