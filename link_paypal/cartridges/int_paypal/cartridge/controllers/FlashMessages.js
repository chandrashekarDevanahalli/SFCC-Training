'use strict';

/**
 * @namespace FlashMessages
 */

const server = require('server');

server.get(
    'Get',
    server.middleware.include,
    function (req, res, next) {
        const Transaction = require('dw/system/Transaction');
        const CustomerModel = require('*/cartridge/models/customer');
        let flashMessages = [];

        if (customer.authenticated && customer.registered) {
            const customerInstance = new CustomerModel(customer);

            Transaction.wrap(function () {
                flashMessages = customerInstance.pullFlashMessages();
            });
        }

        res.render('components/footer/flashMessages', {
            flashMessages: flashMessages
        });

        return next();
    }
);

module.exports = server.exports();
