'use strict';

function evenlyDivides() {
    var N = 12;
    var n;
    var count = 0;
    while (N > 0) {
        N = N / 10;
        count = count + 1;
    }
    return count;
}

module.exports.evenlyDivides = evenlyDivides;