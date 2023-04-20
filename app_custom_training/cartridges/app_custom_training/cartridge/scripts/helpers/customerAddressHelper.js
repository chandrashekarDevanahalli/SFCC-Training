'use strict';

// customer authentication
function customerAuthenticated() {
    var authenticated = customer.isAuthenticated();
    return authenticated;
}

// Get customer Address
function customerAddress() {
    var customerAddress = customer.getAddressBook().getAddresses();
    return customerAddress;
}
module.exports = {
    customerAuthenticated: customerAuthenticated,
    customerAddress: customerAddress
}