'use strict';

/**
 * Searches for stores and creates a plain object of the stores returned by the search
 * @param {string} radius - selected radius
 * @param {string} postalCode - postal code for search
 * @param {string} lat - latitude for search by latitude
 * @param {string} long - longitude for search by longitude
 * @param {Object} geolocation - geloaction object with latitude and longitude
 * @param {boolean} showMap - boolean to show map
 * @param {dw.web.URL} url - a relative url
 * @returns {Object} a plain object containing the results of the search
 */

var base = module.superModule;

function getStores(radius, postalCode, lat, long, geolocation, showMap, url) {
    var StoresModel = require('*/cartridge/models/stores');
    var StoreMgr = require('dw/catalog/StoreMgr');
    var Site = require('dw/system/Site');
    var URLUtils = require('dw/web/URLUtils');
    geolocation.countryCode = 'US';
    var countryCode = geolocation.countryCode;
    var distanceUnit = countryCode === 'US' ? 'mi' : 'km';
    var resolvedRadius = radius ? parseInt(radius, 10) : 15;

    var searchKey = {};
    var storeMgrResult = null;
    var location = {};

    if (postalCode && postalCode !== '') {
        // find by postal code
        searchKey = postalCode;
        storeMgrResult = StoreMgr.searchStoresByPostalCode(
            countryCode,
            searchKey,
            distanceUnit,
            resolvedRadius
        );
        searchKey = {
            postalCode: searchKey
        };
    } else {
        // find by coordinates (detect location)
        location.lat = lat && long ? parseFloat(lat) : geolocation.latitude;
        location.long = long && lat ? parseFloat(long) : geolocation.longitude;

        storeMgrResult = StoreMgr.searchStoresByCoordinates(location.lat, location.long, distanceUnit, resolvedRadius);
        searchKey = {
            lat: location.lat,
            long: location.long
        };
    }

    var actionUrl = url || URLUtils.url('Stores-FindStores', 'showMap', showMap).toString();
    var apiKey = Site.getCurrent().getCustomPreferenceValue('mapAPI');

    var stores = new StoresModel(storeMgrResult.keySet(), searchKey, resolvedRadius, actionUrl, apiKey);

    return stores;
}

base.getStores = getStores;

module.exports = base;