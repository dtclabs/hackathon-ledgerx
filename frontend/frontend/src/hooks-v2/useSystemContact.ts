import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { useMemo } from 'react'

export const useSystemContact = () => {
  const wallets = useAppSelector(walletsSelector)
  const contacts = useAppSelector(contactsSelector)

  const systemContacts = useMemo(() => {
    const recipientEntries =
      contacts?.flatMap((recipient) =>
        recipient.recipientAddresses.map((recipientAddress) => ({
          name: recipient.type === 'individual' ? recipient.contactName : recipient.organizationName,
          address: recipientAddress.address,
          chainId: recipientAddress.blockchainId
        }))
      ) || []

    const walletEntries =
      wallets?.flatMap((wallet) => {
        if (!wallet) return []

        return wallet.supportedBlockchains.map((supportedBlockchain) => ({
          name: wallet.name,
          address: wallet.address,
          chainId: supportedBlockchain
        }))
      }) || []

    return [...recipientEntries, ...walletEntries]
  }, [contacts, wallets])

  return {
    systemContacts
  }
}
