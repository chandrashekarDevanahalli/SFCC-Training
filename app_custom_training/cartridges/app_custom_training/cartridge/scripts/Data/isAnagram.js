function isAna(str1, str2) {
    if (str1.length != str2.length) {
        return false;
    }
    let notebook = {};
    for (let i = 0; i < str1.length; i++) {
        notebook[str1[i]] = (notebook[str1[i]] || 0) + 1;

    }
    for (let i = 0; i < str2.length; i++) {
        if (!notebook[str2[i]]) {
            return false;
        }
        notebook[str2[i]]--;
    }
    return true;

}