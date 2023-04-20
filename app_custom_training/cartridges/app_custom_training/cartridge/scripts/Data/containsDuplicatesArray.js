'use strict';

//using object or map
function containsDuplicate(arr) {
    var store = {};
    for (let i = 0; i < arr.length; i++) {
        var complement = arr[i];
        if (complement in store) {
            return true;
        }
        store[arr[i]] = i;
    }
    return false;

}
/**
 * Time Complexity: O(n),
 * Space Complexity: O(1) 
 *
 */

//using set
function containsDuplicateArray(arr) {
    var set = new Set();
    for (let i = 0; i < arr.length; i++) {
        var complement = arr[i];
        if (set.has(complement)) {
            return true;
        }
        set.add(arr[i]);
    }
    return false;

}

/**
 * Time Complexity: O(n),
 * Space Complexity: O(1) 
 *
 */


module.exports = {
    containsDuplicate: containsDuplicate,
    containsDuplicateArray: containsDuplicateArray
}