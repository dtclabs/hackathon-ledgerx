import { TOKENS_URL } from '@/constants/tokens'

export const getTokenImageBySymbol = (symbol: string) => {
  const token = TOKENS_URL.find((item) => symbol && item.name === symbol.toUpperCase())
  return (token && token.logoUrl) || undefined
}
