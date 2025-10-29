//generate jest test for web3.helper.ts
import { web3Helper } from './web3.helper'

describe('web3Helper', () => {
  it('should return decoded address', function () {
    const result = web3Helper.fromDecodedAddress('0x00000000000000000000000077016474b3fff23611cb827efbadaea44f10637c')
    expect(result).toEqual('0x77016474b3fff23611cb827efbadaea44f10637c')
  })
  it('should throw the error', function () {
    const t = () => {
      web3Helper.fromDecodedAddress('0x0000000000000000000sdfsdaf asdf asdfas')
    }
    expect(t).toThrow(Error)
  })
})
