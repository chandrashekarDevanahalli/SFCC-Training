'use strict';


function CheckIfStringIsAPalindrome(str) {
    var i = 0;
    var j = str.length;
    var t = str[i];
    var l = str[j];
    if (str == "") {
        return 0
    }
    if (str[i] == str[j]) {
        i++;
        j--;
    } else {
        return 0;
    }
    return 1;

}

module.exports = {
    CheckIfStringIsAPalindrome: CheckIfStringIsAPalindrome
}