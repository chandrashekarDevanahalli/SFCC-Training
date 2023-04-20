public int trap(int[] height) {
    int n = height.length;
    int total = 0;
    for( int i = 1; i < n-1 ; i++ ){
        int maxLeft = Integer.MIN_VALUE;
        int maxRight = Integer.MIN_VALUE;
        for( int j = i; j < n; j++){
            if(maxRight < height[j]){
                maxRight = height[j];
            }
        }
        for( int j = i; j >= 0; j--){
            if(maxLeft < height[j]){
                maxLeft = height[j];
            }
        }
        int min = Math.min(maxLeft, maxRight);
        total = total + (min - height[i]);
    }
    return total;
}