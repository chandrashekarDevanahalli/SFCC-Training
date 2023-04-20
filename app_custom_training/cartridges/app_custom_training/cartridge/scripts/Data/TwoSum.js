'use strict';

//brute force
function twoSum(arr) {
    var target = 71;
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 1; j < arr.length; j++) {
            var a = arr[i] + arr[j]
            if (arr[i] + arr[j] == target) {
                return [i, j]
            }
        }
    }
    return false;
}
/**
 * Time Complexity: O(n.square),
 * Space Complexity: O(1) 
 *
 */



var target = 11

//hash map,object
function twoSumOneLoop(arr) {
    var store = {};
    for (let i = 0; i < arr.length; i++) {
        var complement = target - arr[i];
        if (complement in store) {
            return [store[complement], i]
        }
        store[arr[i]] = i
    }
    return null;
}
/**
 * Time Complexity: O(n),
 * Space Complexity: O(n) 
 *
 */

//twopointer approach
function twoSumPointerApproach(arr) {
    var i = 0;
    var j = arr.length;

    while (i < j) {
        if (arr[i] + arr[j] == target) {
            return [i, j]
        } else if (arr[i] < arr[j]) {
            i++;
        } else {
            j--;
        }
    }
    return false
}

/**
 * Time Complexity: O(nlogn),
 * Space Complexity: O(1)
 *
 */

module.exports = {
    twoSum: twoSum,
    twoSumOneLoop: twoSumOneLoop,
    twoSumPointerApproach: twoSumPointerApproach
}