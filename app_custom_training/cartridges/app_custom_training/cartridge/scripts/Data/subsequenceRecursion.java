package recursion;

import java.util.ArrayList;
import java.util.List;

public class subsequences {
    public static void main(String[] args) {
        int arr[] = new int[] { 1, 2, 2 };
        printSubsequences(arr, new ArrayList<>(), 0);
    }

    public static void printSubsequences(int[] arr, List<Integer> bag, int i) {
        if (i == arr.length) {
            System.out.println(bag);
            return;
        }
        bag.add(arr[i]);
        printSubsequences(arr, bag, i + 1);
        bag.remove(bag.size() - 1);
        printSubsequences(arr, bag, i + 1);
    }
}