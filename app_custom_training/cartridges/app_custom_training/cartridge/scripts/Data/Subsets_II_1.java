//nedd to check by Ravi



public static List<List<Integer>> subsetsWithDup(int n, List<Integer> matrix) {
    Collections.sort(matrix);
    return subsetsWithDup(n, matrix,new LinkedList<>(),new LinkedList<>(),0);

}
private static List<List<Integer>> subsetsWithDup(int n, List<Integer> matrix,List<Integer> bag,List<List<Integer>> result,int index){
    if(index == n){
        result.add(new LinkedList<>(bag));
        return result;
    }
    while((index -1 > 0) && matrix.get(index-1) == matrix.get(index)){
        index++;
    }
    bag.add(matrix.get(index));
    subsetsWithDup(n, matrix,bag,result,index+1);
    bag.remove(bag.size()-1);
    subsetsWithDup(n, matrix,bag,result,index+1);
    return result;
}