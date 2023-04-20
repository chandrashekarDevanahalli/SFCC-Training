'use strict';

var paylater = 'paylater';
var enableFunding = 'enable-funding=';

/**
 * Returns a number with an index of the position of the element that contains the specified part of the string among the array of string elements
 *
 * @param {Array} arr Array of the string elements
 * @param {string} substr The part of the string we are looking for among the string elements of the array
 * @returns {number} position
 */
function findSubstringPosition(arr, substr) {
    var position = -1;
    for (var index = 0; index < arr.length; index++) {
        if (arr[index].includes(substr)) {
            position = index;
        }
    }
    return position;
}

/**
 * Returns part of the SDK URL enable funding which contains value paylater
 *
 * @param {Array} arr Array of the string elements
 * @param {number} position The number of the array element that needs to be modified
 * @returns {string} modified enable-funding SDK URL's part
 */
function enableFundingValueModify(arr, position) {
    return enableFunding + paylater + arr[position].split(enableFunding);
}

/**
 * Returns SDK URL which contains value enable-funding
 *
 * @param {string} sdkUrl SDK URL withour value enable-funding=paylater
 * @returns {string} SDK URL which contains value enable-funding=paylater
 */
function addEnableFundigParamPaylater(sdkUrl) {
    var enableFundingPaylater = enableFunding + paylater;
    var sdkElementsArray = sdkUrl.split('&');
    var position = findSubstringPosition(sdkElementsArray, 'enable-funding');

    if (position !== -1) {
        sdkElementsArray[position] = enableFundingValueModify(sdkElementsArray, position);
    } else {
        sdkElementsArray.splice(position, 0, enableFundingPaylater);
    }

    return sdkElementsArray.join('&');
}

module.exports = {
    addEnableFundigParamPaylater: addEnableFundigParamPaylater
};
