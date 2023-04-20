'use strict';

var server = require('server')

server.get('Show', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.msg = 'This is from show';
    //let arr = [1, 3, 2, 8, 2, 1]
    //let arr = [1, 8, 6, 2, 5, 4, 8, 3, 7];
    let arr = [1, 2, 3, 4, 5, 6]
    let n = 4;
    let i = 0;
    let j = arr.length - 1;
    let str = "abba"

    //let s = "anagram",t = "nagaram";
    //let arr = [3, 2, 1]
    //var data = require('*/cartridge/scripts/Data/sorting');
    //var twoSum = require('*/cartridge/scripts/Data/TwoSum');
    //var sort = data.selectionSort(arr)
    //var sort = data.bubbleSort(arr)
    //var sum = duplicate.containsDuplicateArray(arr);
    //var duplicate = require('*/cartridge/scripts/Data/validAnagram');
    //var sum = duplicate.areAnagram(s, t)
    var containswater = require('*/cartridge/scripts/Data/CheckIfStringIsAPalindrome');
    var sum = containswater.CheckIfStringIsAPalindrome(str);

    //var sum = twoSum.twoSumPointerApproach(arr)
    res.json({
        sum: sum
    });
    next();
});

module.exports = server.exports();