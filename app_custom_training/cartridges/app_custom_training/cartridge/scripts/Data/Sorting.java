import java.util.Arrays;

public class Sorting {
    public static void main(String[] args) {
        int[] nums = { 9, 1, 2, 3, 4, 5, 6, 7, 8, };
        bubbleSort(nums);
        System.out.println((Arrays.toString(nums)));
    }

    private static void bubbleSort(int[] arr) {
        int checks = 0;
        for (int i = 0; i < arr.length - 1; i++) {
            boolean didSwap = false;
            for (int j = 0; j < arr.length - 1 - i; j++) {
                checks++;
                if (arr[j] > arr[j + 1]) {
                    didSwap = true;
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
            if (didSwap == false) {
                System.out.println(checks);
                return;
            }
        }

    }

    private static void selectionSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int smallestIndex = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[smallestIndex]) {
                    smallestIndex = j;
                }
            }
            if (smallestIndex != i) {
                int temp = arr[i];
                arr[i] = arr[smallestIndex];
                arr[smallestIndex] = temp;
            }
        }
    }
}