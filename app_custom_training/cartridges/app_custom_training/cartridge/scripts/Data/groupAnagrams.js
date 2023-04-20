var groupAnagrams = function (strs) {

    let map = {};


    // {

    //   "1111100010101" : ["cat, tac"];
    // }

    for (let i = 0; i < strs.length; i++) {
        let s = strs[i];

        let leader = [];
        for (let i = 0; i < s.length; i++) {
            leader[s[i].charCodeAt(0) - 97] = (leader[s[i].charCodeAt(0) - 97] || 0) + 1;
        }

        map[leader] ? map[leader].push(s) : map[leader] = [s];
    }

    let result = [];

    return Object.values(map)
};


var groupAnagrams = function (strs) {
    const map = {};
    const result = [];

    for (let i = 0; i < strs.length; i++) {
        const hash = getStringHash(strs[i]);

        // map[hash] ? map[hash].push(strs[i]) : map[hash] = [strs[i]];

        if (map[hash]) {
            map[hash].push(strs[i]);
        } else {
            map[hash] = [strs[i]];
        }
    }

    for (let key in map) {
        result.push(map[key]);
    }

    return result;
};

function getStringHash(str) {
    const hash = [];
    for (let i = 0; i < str.length; i++) {
        hash[str.charCodeAt(i) - 97] = (hash[str.charCodeAt(i) - 97] || 0) + 1;
    }
    return hash;
}


///

var groupAnagrams = function (strs) {
    const map = {};
    const result = [];

    for (let i = 0; i < strs.length; i++) {
        const hash = getStringHash(strs[i]);

        // map[hash] ? map[hash].push(strs[i]) : map[hash] = [strs[i]];

        if (map[hash]) {
            map[hash].push(strs[i]);
        } else {
            map[hash] = [strs[i]];
        }
    }

    for (let key in map) {
        result.push(map[key]);
    }

    return result;
};

function getStringHash(str) {
    const hash = [];
    for (let i = 0; i < str.length; i++) {
        hash[str.charCodeAt(i) - 97] = (hash[str.charCodeAt(i) - 97] || 0) + 1;
    }
    return hash;
}