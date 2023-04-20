'use strict';

/**
 * 
 * @param {array} arr 
 * @param {i} i = 0;
 * @param {j} arr.length - 1
 * 
 */

function ReverseAnArrayUsingRecursion(arr, i, j) {
    if (i >= j) {
        return;
    }
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;

    ReverseAnArrayUsingRecursion(arr, i + 1, j - 1);
}


module.exports = {
    ReverseAnArrayUsingRecursion: ReverseAnArrayUsingRecursion
}