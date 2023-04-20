public int maxArea(int[] height) {
    int n = height.length;
    int maxArea = Integer.MIN_VALUE;
    int left = 1;
    int right = n;
    int h = Integer.MAX_VALUE;
    while ( left < right){
        int width = right - left;
        h = Math.min(height[left-1] , height[right-1]);
        int r = h * width;
        if(maxArea < r) {
            maxArea = r;
        }
        if(height[left-1] < height[right-1]){
            left++; //moved this line which you wrote earler to this if block
        }else {
            right--;
        }
    }
    return maxArea;
}
}