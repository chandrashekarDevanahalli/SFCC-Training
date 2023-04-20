import java.util.ArrayList;
import java.util.List;

public class subsequences {
    public static void main(String[] args) {
        int arr[] = new int[]{2,3,4};
        printSubsequences(arr, new ArrayList<>(), 0, 6, 0);
    }

    public static void printSubsequences(int[] arr, List<Integer> bag, int i, int target, int sum) {
        if(sum == target) {
            System.out.println(bag);
            return;
        }
        if(sum > target) {
            return;
        }
        if (i == arr.length) {
            return;
        } 
        bag.add(arr[i]);
        printSubsequences(arr, bag, i, target, sum+arr[i]);
        bag.remove(bag.size()-1);
        printSubsequences(arr, bag, i+1, target, sum );

    }
}