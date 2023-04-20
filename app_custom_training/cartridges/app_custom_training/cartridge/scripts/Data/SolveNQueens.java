class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        nQueens(0, n, new ArrayList<>(), result);
        return result;
    }
    public static void nQueens(int row, int n, List<Integer> ds, List<List<String>> result) {
        if (row == n) {
            List<String> arr = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                String str = formQueen(ds.get(i), n);
                arr.add(str);
            }
            result.add(arr);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isValid(row, col, ds)) {
                ds.add(col);
                nQueens(row + 1, n, ds, result);
                ds.remove(ds.size() - 1);
            }
        }
    }
    public static boolean isValid(int row, int col, List<Integer> ds) {
        for (int i = 0; i < row; i++) {
            if (col == ds.get(i) || col == ds.get(i) + (row - i) || col == ds.get(i) - (row - i)) {
                return false;
            }
        }
        return true;
    }
    public static String formQueen(int position, int n) {
        StringBuilder answer = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i == position) {
                answer.append('Q');
            } else {
                answer = answer.append('.');
            }
        }
        return answer.toString();
    }
}