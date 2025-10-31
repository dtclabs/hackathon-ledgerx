export const isExistedRecipient = (address: string, recipientList, chainId?: number) => {
  if (recipientList) {
    const existedRecipient = recipientList.find((item) =>
      item.recipientAddresses.find(
        (recipientItem) =>
          recipientItem.address && address && recipientItem.address.toLowerCase() === address.toLowerCase()
      )
    )
    if (existedRecipient) return true
  }
  return false
}

export const isExistedSource = (address: string, sourceList) => {
  if (sourceList) {
    const existedSource = sourceList.find(
      (item) => item.address && address && item.address.toLowerCase() === address.toLowerCase()
    )
    if (existedSource) return true
  }
  return false
}

export const findMatchingAddress = (recpients, currentAddress) => {
  for (const recipient of recpients) {
    if (Array.isArray(recipient.recipientAddresses)) {
      for (const recipientAddress of recipient.recipientAddresses) {
        if (recipientAddress.address.toLowerCase() === currentAddress.toLowerCase()) {
          return { recipient }
        }
      }
    }
  }
  return false
}
