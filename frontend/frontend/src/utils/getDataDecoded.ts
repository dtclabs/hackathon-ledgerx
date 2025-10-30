// import InputDataDecoder from 'ethereum-input-data-decoder'
import abi from '@/config/abi/disperse.json'

// const decoder = new InputDataDecoder(abi)

export enum IDisperseMethod {
  DisperseEther = 'disperseEther',
  DisperseToken = 'disperseToken'
}

// export const getDataDecoded = (data: string) => {
//   const result = decoder.decodeData(data)
//   return result
// }
