'use strict';

//using sort 
var isAnagram = function (s, t) {

    // If length of both strings is not same, then they
    // cannot be anagram
    var n1 = s.length;
    var n2 = t.length;
    if (n1 != n2) {
        return false
    }
    // Sort both the strings
    var str1 = s.split("").sort().join("");
    var str2 = t.split("").sort().join("");
    // Compare sorted strings
    for (let i = 0; i < n1; i++)
        if (str1[i] != str2[i])
            return false;

    return true;
}

/**
 * Time Complexity: O(N * logN), For sorting.
 * Space: O(1) as it is using constant extra space
 *
 */

//using Array
function areAnagram(s, t) {
    var str1 = s.split("")
    var str2 = t.split("")
    // If length of both strings is not same, then they
    // cannot be anagram
    var n1 = s.length;
    var n2 = t.length;
    if (n1 != n2) {
        return false
    }

    // Create a count array and initialize
    let count = new Array(26).join('0').split('');
    for (let i = 0; i < s.length; i++) {
        count[str1[i].charCodeAt(0) - 'a'.charCodeAt(0)]++;
        count[str2[i].charCodeAt(0) - 'a'.charCodeAt(0)]--;
    }

    for (let i = 0; i < count.length; i++)
        if (count[i] != 0) {
            return false;
        }
    return true;
}


/**
 * Time Complexity: O(n),
 * Space Complexity:O(26) O(1) 
 *
 */

module.exports = {
    isAnagram: isAnagram,
    areAnagram: areAnagram
}