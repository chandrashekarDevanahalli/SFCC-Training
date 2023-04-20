'use strict';


function containsWithWater(height) {
    var max = 0;
    var l = 0;
    var r = height.length - 1;
    var checks = 0;
    while (l < r) {
        checks++;
        var lh = height[l];
        var rh = height[r];
        var min_h = Math.min(lh, rh);
        max = Math.max(max, min_h * (r - 1))
        if (lh < rh) {
            l++;
        } else {
            r--;
        }
    }

    return max;

}

module.exports.containsWithWater = containsWithWater;