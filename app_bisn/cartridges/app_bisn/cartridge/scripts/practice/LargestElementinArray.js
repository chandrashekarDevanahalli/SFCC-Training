'use strict';

// var arr = [];
// arr[1, 2, 3, 3, 2, 5];

// var n = 7;

function largest(arr, n) {
    // write your code here
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) {
            console.log(arr[i]);
        } else {
            console.log(arr[i - 1])
        }
    }
}

module.exports = {
    largest: largest
}