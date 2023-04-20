let visited = [];
let output = [];

function permutation(str, result) { //cat
    if (result.length == str.length) {
        output.push(result);
        return;
    }
    for (let i = 0; i < str.length; i++) {
        if (visited[i]) continue;
        result += str[i];
        visited[i] = true;
        permutation(str, result);
        visited[i] = false;
        result.slice(0, result.length - 1);
    }
}