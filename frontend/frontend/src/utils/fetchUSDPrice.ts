export const fetchUSDPriceApi = (token, date) =>
  `${process.env.NEXT_PUBLIC_API_URL}/coingecko/coins/history?id=${token}&date=${date}`
