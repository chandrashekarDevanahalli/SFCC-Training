import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    public static void main(String[] args) {
        int[] res = topKFrequent(new int[] { 1, 1, 2, 2, 2 }, 1);
        System.out.println(Arrays.toString(res));
    }

    public static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            if (map.containsKey(nums[i])) {
                map.put(nums[i], map.get(nums[i]) + 1);
            } else {
                map.put(nums[i], 1);
            }
        }

        int size = 0;

        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            size = Math.max(entry.getValue(), size);
        }

        List<List<Integer>> tempArr = new ArrayList<>(size + 1);

        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (tempArr.get(entry.getValue()) != null) {
                tempArr.get(entry.getValue()).add(entry.getKey());
            } else {
                tempArr.add(entry.getValue(), new ArrayList<>());
                tempArr.get(entry.getValue()).add(entry.getKey());
            }
        }

        int[] res = new int[k];

        int count = 0;

        for (int i = tempArr.size() - 1; i >= 0; i--) {
            if (tempArr.get(i) != null) {
                for (int num : tempArr.get(i)) {
                    res[count] = num;
                    count++;
                    if (count == k) {
                        break;
                    }
                }
            }
            if (count == k) {
                break;
            }
        }
        return res;

    }
}