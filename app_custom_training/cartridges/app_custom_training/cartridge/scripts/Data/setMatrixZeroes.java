public void setZeroes(int[][] matrix) {
    List<AbstractMap.SimpleEntry<Integer, Integer>> list= new ArrayList();
    int n = matrix.length;
    int nn = matrix[0].length;
    for(int row = 0; row < n; row++){
        for(int column = 0; column < nn; column++){
            if(matrix[row][column] == 0){
                AbstractMap.SimpleEntry<Integer, Integer> entry
                  = new AbstractMap.SimpleEntry<>(row, column);
                list.add(entry);
            }
        }
    }
    for(AbstractMap.SimpleEntry<Integer, Integer> entry : list) {
        int r = entry.getKey();
        int col = entry.getValue();
        for(int row = 0; row < n; row++){
            for(int column = 0; column < nn; column++){
                 if(column == col) {
                     matrix[row][column] = 0;
                 }
                 if(r == row) {
                     matrix[row][column] = 0;
                 }
            }
         }
    }
}