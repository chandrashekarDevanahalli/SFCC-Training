''

public class subsequences {
    public static void main(String[] args) {
        int arr[] = new int[]{1, -5, 11, 4, 2};
        printSubsequences(arr, new ArrayList<>(), 0, 7, 0);
    }
    public static boolean printSubsequences(int[] arr, List<Integer> bag, int i, int target, int sum) {
        if(sum > target) {
            return false;
        }
        if (i == arr.length) {
            if(sum == target) {
                System.out.println(bag);
                return true;
            }
            return false;
        }
        bag.add(arr[i]);
        if(printSubsequences(arr, bag, i+1, target, sum+arr[i]) == true) {
            return true;
        }
        bag.remove(bag.size()-1);
        return printSubsequences(arr, bag, i+1, target, sum );
    }
}
Starting code for today's class