'use strict';


function SumOfFirstnNumbersUsingRecursion(n) {
    if (n == 0) {
        return 0
    }
    if (n <= 1) {
        return n
    }
    return n + SumOfFirstnNumbersUsingRecursion(n - 1);
}
module.exports.SumOfFirstnNumbersUsingRecursion = SumOfFirstnNumbersUsingRecursion