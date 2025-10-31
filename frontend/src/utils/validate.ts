import _ from 'lodash'

export const isRecipientExistInForm = ({
  list,
  value
}: {
  value: string
  list: { address: string; chainId: string }[]
}) => {
  const sameAddresses = list.filter((item) => item.address && item.address.toLowerCase() === value.toLowerCase())
  if (sameAddresses.length === 1) {
    return true
  }
  if (sameAddresses.length > 1) {
    const uniqueArray = _.uniqWith(sameAddresses, _.isEqual)
    if (uniqueArray.length === sameAddresses.length) {
      return true
    }
    return false
  }
  return true
}
