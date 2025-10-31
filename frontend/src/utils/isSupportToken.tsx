import { IToken } from '@/hooks/useNetwork'

export const isSupportToken = (symbol: string, tokens: IToken[]) =>
  symbol && tokens[0].nativeToken && symbol.toLowerCase() === tokens[0].nativeToken.toLowerCase()
    ? tokens[0]
    : tokens.find((token: IToken) => token.name && symbol && token.name.toLowerCase() === symbol.toLowerCase())
