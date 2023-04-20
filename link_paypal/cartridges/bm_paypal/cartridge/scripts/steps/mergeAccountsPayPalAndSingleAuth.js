'use strict';

/* global dw module */

const File = require('dw/io/File');
const Site = require('dw/system/Site');
const Bytes = require('dw/util/Bytes');
const Logger = require('dw/system/Logger');
const URLUtils = require('dw/web/URLUtils');
const Calendar = require('dw/util/Calendar');
const Encoding = require('dw/crypto/Encoding');
const FileWriter = require('dw/io/FileWriter');
const StringUtils = require('dw/util/StringUtils');
const Transaction = require('dw/system/Transaction');
const CustomerMgr = require('dw/customer/CustomerMgr');
const CSVStreamWriter = require('dw/io/CSVStreamWriter');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

let delay;
let token;
let httpService;
let serviceName;

const url = URLUtils.abs('Migration-RemovePayPalCustomer').toString();

/**
 * Timeout
 * @param {number} milliseconds The execution interval.
 */
const setTimeout = function (milliseconds) {
    const period = milliseconds || 1000;
    const endTime = Date.now() + period;

    while (Date.now() < endTime) {
        // wait
    }
};

/**
 * Encodes object into encoded string
 * @param {Object} object data for encoding
 * @returns {string} encoded string
 */
const encodeString = function (object) {
    return Encoding.toBase64(new Bytes(JSON.stringify(object)));
};

/**
 * Get logger instance
 * @param {Object} error Error message
 */
const createErrorLog = function (error) {
    const paypalLogger = Logger.getLogger('PayPal', 'PayPal_General');

    if (empty(error)) {
        paypalLogger.debug('Empty log entry');
    } else {
        paypalLogger.error(error.stack ? (error.message + error.stack) : error);
    }
};

/**
 * Differences between arrays with objects by keys (Find values that are in primaryArray but not in secondaryArray)
 * @param {Array<Object>} primaryArray primary array with objects
 * @param {Array<Object>} secondaryArray secondary array with objects
 * @param {Array} keys list of keys to compare values
 * @returns {Array<Object>} filtered array
 */
const differenceBetweenArraysWithObjectsByKeys = function (primaryArray, secondaryArray, keys) {
    return primaryArray.filter(function (primaryItem) {
        return !secondaryArray.some(function (secondaryItem) {
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                const isEnumValue = primaryItem[key] instanceof dw.value.EnumValue;
                const primaryValue = isEnumValue ? primaryItem[key].value : primaryItem[key];
                const secondaryValue = isEnumValue ? secondaryItem[key].value : secondaryItem[key];

                if (primaryValue !== secondaryValue) {
                    return false;
                }
            }

            return true;
        });
    });
};

/**
 * Get external ID by provider ID
 * @param {dw.util.Collection} externalProfiles Collection of any external profiles the customer may have
 * @param {string} providerID Authentication provider ID.
 * @returns {boolean} Authentication provider ID matches
 */
const getExternalId = function (externalProfiles, providerID) {
    const result = externalProfiles.toArray().find(function (externalProfile) {
        return externalProfile.authenticationProviderID === providerID;
    });

    return result ? result.externalID : false;
};

/**
 * Check external profiles for containing authentication provider ID
 * @param {dw.util.Collection} externalProfiles Collection of any external profiles the customer may have
 * @param {string} providerID Authentication provider ID.
 * @returns {boolean} Authentication provider ID matches
 */
const checkAuthenticationProvider = function (externalProfiles, providerID) {
    return externalProfiles.toArray().some(function (externalProfile) {
        return externalProfile.authenticationProviderID === providerID;
    });
};

/**
 * Check if address name already exists
 * @param {Array<dw.customer.CustomerAddress>} currentAddresses a sorted list of addresses in the address book
 * @param {string} addressName the name of the address
 * @returns {boolean} true/false
 */
const isAddressNameExists = function (currentAddresses, addressName) {
    return currentAddresses.some(function (customerAddress) {
        return customerAddress.ID === addressName;
    });
};

/**
 * Merge all orders with customer
 * @param {dw.util.SeekableIterator} orders order history for the customer in the current storefront site
 * @param {string} customerNo customer number of the customer associated with this container
 * @returns {number} the number of merged orders
 */
const mergeOrdersWithCustomer = function (orders, customerNo) {
    orders.asList().toArray().forEach(function (order) {
        Transaction.wrap(function () {
            order.setCustomerNo(customerNo);
        });
    });

    return orders.count;
};

/**
 * Merge billing agreements with Profile
 * @param {dw.customer.Profile} currentProfile customer profile
 * @param {dw.customer.Profile} externalProfile customer profile
 * @returns {number} number of merged billing agreements
 */
const mergeBillingAgreementsWithProfile = function (currentProfile, externalProfile) {
    const keys = ['baID', 'default', 'email'];
    const currentBillingAgreement = JSON.parse(currentProfile.custom.PP_API_billingAgreement) || [];
    const externalBillingAgreement = JSON.parse(externalProfile.custom.PP_API_billingAgreement) || [];

    if (empty(externalBillingAgreement)) {
        return 0;
    }

    const externalUnique = differenceBetweenArraysWithObjectsByKeys(externalBillingAgreement, currentBillingAgreement, keys);

    const mergedData = currentBillingAgreement.concat(externalUnique);

    Transaction.wrap(function () {
        currentProfile.custom.PP_API_billingAgreement = JSON.stringify(mergedData);
    });

    return externalUnique.length;
};

/**
 * Merge addresses customers
 * @param {dw.customer.Customer} currentCustomer Represents a current customer class
 * @param {dw.customer.Customer} externalCustomer Represents a external customer class
 * @returns {number} number of merged addresses
 */
const mergeCustomerAddresses = function (currentCustomer, externalCustomer) {
    const keys = [
        'firstName', 'lastName', 'phone',
        'address1', 'address2',
        'city', 'postalCode',
        'stateCode', 'countryCode'
    ];

    const currentAddresses = currentCustomer.addressBook.addresses.toArray();
    const externalAddresses = externalCustomer.addressBook.addresses.toArray();

    if (empty(externalAddresses)) {
        return 0;
    }

    const externalUniqueAddresses = differenceBetweenArraysWithObjectsByKeys(externalAddresses, currentAddresses, keys);

    externalUniqueAddresses.forEach(function (externalAddress) {
        Transaction.wrap(function () {
            const addressName = isAddressNameExists(currentAddresses, externalAddress.ID)
                ? externalAddress.ID + ' (1)'
                : externalAddress.ID;

            const customerAddress = currentCustomer.addressBook.createAddress(addressName);

            if (customerAddress) {
                customerAddress.setAddress1(externalAddress.address1);
                customerAddress.setAddress2(externalAddress.address2);
                customerAddress.setCity(externalAddress.city);
                customerAddress.setCountryCode(externalAddress.countryCode.value);
                customerAddress.setFirstName(externalAddress.firstName);
                customerAddress.setLastName(externalAddress.lastName);
                customerAddress.setPhone(externalAddress.phone);
                customerAddress.setPostalCode(externalAddress.postalCode);
                customerAddress.setStateCode(externalAddress.stateCode);
            }
        });
    });

    return externalUniqueAddresses.length;
};

/**
 * Init http service
 * @returns {dw.svc.Service} http service
 */
const getHttpService = function () {
    if (httpService) {
        return httpService;
    }

    const configObj = {
        createRequest: function (service, params) {
            service.setURL(url);
            service.setRequestMethod('POST');
            service.addHeader('Content-Type', 'application/json');
            service.addHeader('Authorization', 'Bearer ' + token);

            return JSON.stringify(params);
        },
        parseResponse: function (_, httpClient) {
            return JSON.parse(httpClient.getText());
        }
    };

    httpService = LocalServiceRegistry.createService(serviceName, configObj);

    return httpService;
};

/**
 * Remove customer
 * @param {Object} payload customerNo and externalID values
 * @param {dw.customer.Profile} currentProfile customer profile
 */
const removeCustomer = function (payload, currentProfile) {
    try {
        const result = getHttpService().call(payload);

        setTimeout(delay);

        if (result.isOk()) {
            Transaction.wrap(function () {
                currentProfile.custom.isMergedAccount = true;
            });
        } else {
            throw new Error(
                StringUtils.format(
                    '{0} {1}: {2}',
                    result.error, result.msg,
                    JSON.parse(result.errorMessage).message
                )
            );
        }
    } catch (error) {
        createErrorLog(error);
    }
};

/**
 * Merging Process
 * @param {dw.customer.Profile} currentProfile Represents a current profile class
 * @param {dw.customer.Profile} externalProfile Represents a external profile class
 * @param {dw.util.SeekableIterator} externalOrders external orders list
 * @returns {Object} number of merged
 */
const mergingProcess = function (currentProfile, externalProfile, externalOrders) {
    const numberOfMerged = {
        email: currentProfile.email,
        currentCustomerNo: currentProfile.customerNo,
        externalCustomerNo: externalProfile.customerNo
    };

    numberOfMerged.orders = mergeOrdersWithCustomer(
        externalOrders,
        currentProfile.customerNo
    );

    numberOfMerged.billingAgreement = mergeBillingAgreementsWithProfile(
        currentProfile,
        externalProfile
    );

    numberOfMerged.addresses = mergeCustomerAddresses(
        currentProfile.customer,
        externalProfile.customer
    );

    removeCustomer({
        externalID: getExternalId(externalProfile.customer.externalProfiles, 'PayPal')
    }, currentProfile);

    return numberOfMerged;
};

/**
 * Prepare profile for merge process
 * @param {dw.customer.Profile} currentProfile Represents a current profile class
 * @returns {Object} current profile, external profile and orders
 */
const getProfileForMergeProcess = function (currentProfile) {
    let externalOrders;
    let externalProfile;

    if (!currentProfile.customer.isExternallyAuthenticated()) {
        externalProfile = CustomerMgr.searchProfile(
            'email = {0} AND customerNo != {1}',
            currentProfile.email, currentProfile.customerNo
        );
    }

    if (externalProfile && externalProfile.customer.isExternallyAuthenticated()) {
        const externalCustomer = externalProfile.customer;
        const isPayPalProvider = checkAuthenticationProvider(externalCustomer.externalProfiles, 'PayPal');

        if (isPayPalProvider) {
            externalOrders = externalCustomer.orderHistory.orders;
        }
    }

    return {
        currentProfile: currentProfile,
        externalOrders: externalOrders,
        externalProfile: externalProfile
    };
};

/**
 * Process file report path
 * @param {dw.util.HashMap} parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @returns {string} file path
 */
const getFileReportPath = function (parameters) {
    const dateTime = StringUtils.formatCalendar(new Calendar(), 'yyyy-MM-dd\'T\'hh-mm-ss');

    return parameters.get('FileReportPath').replace('{DateTime}', dateTime);
};

let profiles;
let fileWriter;
let csvStreamWriter;

const processResult = {
    email: '',
    currentCustomerNo: '',
    externalCustomerNo: '',
    orders: 0,
    addresses: 0,
    billingAgreement: 0
};

/**
 * Before step function
 * @param {dw.util.HashMap} parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 */
const beforeStep = function (parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    delay = parameters.get('Delay');
    serviceName = parameters.get('ServiceName');

    token = encodeString({
        PP_CWPP_Agent_Login: Site.current.getCustomPreferenceValue('PP_CWPP_Agent_Login'),
        PP_CWPP_Agent_Password: Site.current.getCustomPreferenceValue('PP_CWPP_Agent_Password'),
        PP_CWPP_Key: 'MergeAccountsPayPalAndSingleAuthentication'
    });

    const fileReportPath = getFileReportPath(parameters);

    const directoryPath = fileReportPath.split('/').slice(0, -1).join('/');
    const reportDirectoryPath = new File(directoryPath);

    if (!reportDirectoryPath.exists()) {
        reportDirectoryPath.mkdir();
    }

    const searchProfiles = CustomerMgr.searchProfiles(
        'custom.isMergedAccount = {0} OR custom.isMergedAccount = {1}',
        'customerNo ASC',
        null, false
    );

    profiles = searchProfiles.asList().toArray().filter(function (profile) {
        return !profile.customer.externallyAuthenticated;
    });

    const csvFile = new File(fileReportPath);

    fileWriter = new FileWriter(csvFile);
    csvStreamWriter = new CSVStreamWriter(fileWriter);

    csvStreamWriter.writeNext([
        'email',
        'customerNo (current)',
        'customerNo (external)',
        'Orders (count)',
        'Addresses (count)',
        'Billing Agreement (count)'
    ]);
};

/**
 * Total count function
 * @param {dw.util.HashMap} _parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 * @returns {number} Returns the total number of items that are available.
 */
const getTotalCount = function (_parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    return profiles.length;
};

/**
 * Read function
 * @param {dw.util.HashMap} _parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 * @returns {Object} Returns the next element from the Iterator.
 */
const read = function (_parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    return profiles.length ? getProfileForMergeProcess(profiles.shift()) : undefined;
};

/**
 * Process function
 * @param {Object} profile receives the item returned by the read function (current profile, external profile and orders)
 * @param {dw.util.HashMap} _parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 * @returns {Object} number of merged items
 */
const process = function (profile, _parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    try {
        if (profile.externalProfile === null) {
            Transaction.wrap(function () {
                profile.currentProfile.custom.isMergedAccount = true;
            });

            return Object.assign({}, processResult, {
                email: profile.currentProfile.email,
                currentCustomerNo: profile.currentProfile.customerNo
            });
        }

        return mergingProcess(
            profile.currentProfile,
            profile.externalProfile,
            profile.externalOrders
        );
    } catch (error) {
        createErrorLog(error);

        return processResult;
    }
};

/**
 * Write function
 * @param {dw.util.List} lines a list of items
 * @param {dw.util.HashMap} _parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 */
const write = function (lines, _parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    lines.toArray().forEach(function (line) {
        csvStreamWriter.writeNext([
            line.email,
            line.currentCustomerNo,
            line.externalCustomerNo,
            line.orders,
            line.addresses,
            line.billingAgreement
        ]);
    });
};

/**
 * After step function
 * @param {boolean} _success step status
 * @param {dw.util.HashMap} _parameters that are available as scriptable objects for each exposed module function and for the dw.job.JobStepExecution object.
 * @param {dw.job.JobStepExecution} _stepExecution object allows read-only access to information about the current step execution and job execution
 */
const afterStep = function (_success, _parameters, _stepExecution) { // eslint-disable-line no-unused-vars
    csvStreamWriter.close();
    fileWriter.close();
};

module.exports = {
    beforeStep: beforeStep,
    getTotalCount: getTotalCount,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};
