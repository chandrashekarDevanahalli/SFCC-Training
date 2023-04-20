'use strict';


function fun() {
    var a = 10;
    this.id = a
    return this;
}

var gun = {
    jun: function () {
        return 'this is jun'
    }
}

module.exports = {
    fun,
    gun
};