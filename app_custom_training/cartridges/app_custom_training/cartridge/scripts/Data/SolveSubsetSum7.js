// Need to check this code is working or not which is submited by Ravi Shankar Dubey


function subsetSum(nums, n) {
    const subsetSum = [];

    createSubsets(nums, n, 0, subsetSum, 0);

    return subsetSum.sort((a, b) => a - b);
}

function createSubsets(nums, n, sum, subsetSum, i) {
    subsetSum.push(sum);

    if (i >= nums.length) {
        return;
    }

    for (let j = i; j < nums.length; j++) {
        if (j > i && nums[j] === nums[j - 1]) {
            continue;
        }

        sum += nums[j];
        createSubsets(nums, n, sum, subsetSum, j + 1);
        sum -= nums[j];
    }
}