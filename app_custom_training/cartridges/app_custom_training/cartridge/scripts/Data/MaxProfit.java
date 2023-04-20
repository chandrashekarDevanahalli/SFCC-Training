public int MaxProfit(int[] prices) {
    int maxProfit = 0;
    int buyPrice = prices[0];
    
    for (int i=1; i<prices.Length; i++)
    {
        if (prices[i] < buyPrice)
        {
            buyPrice = prices[i];
        }
        else
        {
            maxProfit = Math.Max(maxProfit, prices[i] - buyPrice);
        }
    }
    
    return maxProfit;
}