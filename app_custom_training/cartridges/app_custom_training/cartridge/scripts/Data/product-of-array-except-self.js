let nums = [1, 2, 3, 4];

let left = [];
let right = [];

let handL = 1;
let handR = 1;

for (let i = 0; i < nums.length; i++) {
    left.push(handL);
    handL = handL * nums[i];

    right[4 - 1 - i] = handR;
    handR = handR * nums[4 - 1 - i];
}

let result = [];

for (let i = 0; i < nums.length; i++) {
    result.push(left[i] * right[i]);
}

console.log(result);