import { useSelectAvailableSource } from '@/hooks-v2/make-payments/useSelectAvailableSource'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { groupedChartOfAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { fiatCurrenciesSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useGetTagsQuery } from '@/slice/tags/tags-api'
import { selectWalletMapByAddress, walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useMemo } from 'react'
import { getCurrencyImage } from './useFiatPaymentForm/useFiatPaymentForm'
import { CurrencyType, PurposeOfRemittance } from '@/api-v2/payment-api'
import _ from 'lodash'
import { SourceType } from '@/slice/wallets/wallet-types'

const useCreatePayment = ({ selectedSourceId, currencyType = CurrencyType.CRYPTO }) => {
  const organizationId = useOrganizationId()
  const wallets = useAppSelector(walletsSelector)
  const chainIcons = useAppSelector(selectChainIcons)
  const walletMap = useAppSelector(selectWalletMapByAddress)
  const chartOfAccounts = useAppSelector(groupedChartOfAccounts)
  const verifiedCryptocurrencies = useAppSelector(selectVerifiedCryptocurrencies)
  const selectedChain = useAppSelector(selectedChainSelector)
  const fiatCurrencies = useAppSelector(fiatCurrenciesSelector)
  const { sourcesTotalBasedOnChain, isLoading } = useSelectAvailableSource()
  const contacts = useAppSelector(contactsSelector)

  const { data: tags } = useGetTagsQuery({ organizationId }, { skip: !organizationId })

  const selectedSource = useMemo(() => {
    const matchedWallet = sourcesTotalBasedOnChain?.find((option) => option.id === selectedSourceId)
    return {
      address: matchedWallet?.address ?? '',
      value: matchedWallet?.address ?? '',
      label: matchedWallet?.label ?? '',
      totalPrice: matchedWallet?.totalPrice ?? '',
      type: matchedWallet?.typeAddress ?? '',
      id: matchedWallet?.sourceId ?? '',
      supportedBlockchains: matchedWallet?.supportedBlockchains ?? []
    }
  }, [sourcesTotalBasedOnChain, selectedSourceId])

  const tokenOptions = useMemo(() => {
    if (!verifiedCryptocurrencies?.length || !selectedChain?.id) return []

    const sourceWalletId = selectedSourceId
    const sourceWallet = walletMap[sourceWalletId]

    // Ensure sourceWallet and sourceWallet.sourceType are defined before accessing them
    const filteredTokens = verifiedCryptocurrencies.filter(
      (token) => !sourceWallet || sourceWallet.sourceType !== 'eth' || token.symbol !== 'USDT'
    )

    return filteredTokens.flatMap((token) =>
      token.addresses
        .filter((address) => {
          if (
            address.blockchainId === selectedChain.id &&
            (address?.address?.toLowerCase() || address?.type === 'Coin')
          ) {
            return address
          }
          return null
        })
        .map((address) => ({
          value: token.publicId,
          label: token.symbol,
          src: token.image?.small,
          address
        }))
    )
  }, [verifiedCryptocurrencies, selectedChain?.id, selectedSourceId])

  const contactOptions = useMemo(() => {
    const recipientEntries =
      contacts?.flatMap((recipient) => {
        const groupedAddress = _.groupBy(
          recipient.recipientAddresses?.map((_item) => ({ ..._item, address: _item.address.toLowerCase() })),
          'address'
        )
        const recipientAddresses = _.map(groupedAddress, (value, key) => ({
          publicId: value[0].publicId,
          address: key,
          supportedBlockchains: _.map(value, 'blockchainId')
        }))

        return recipientAddresses.map((recipientAddress) => ({
          value: recipientAddress.address,
          label: recipient.type === 'individual' ? recipient.contactName : recipient.organizationName,
          address: recipientAddress.address,
          chainId: selectedChain?.id,
          supportedBlockchains: recipientAddress.supportedBlockchains,
          metadata: {
            id: recipientAddress.publicId,
            type: 'recipient_address' // Consider replacing with a constant
          },
          // eslint-disable-next-line no-unneeded-ternary
          isUnknown: recipient.organizationName || recipient?.contactName ? false : true
        }))
      }) || []

    const walletEntries =
      wallets?.flatMap((wallet) => {
        if (!wallet) return [] // Check if wallets is null or undefined

        return wallet.supportedBlockchains
          .filter(
            (supportedBlockchain) =>
              typeof supportedBlockchain === 'string' && supportedBlockchain === selectedChain?.id
          ) // Check if supportedBlockchain is a string and matches selectedChain.id
          .map((supportedBlockchain) => {
            if (!chainIcons[supportedBlockchain]) {
              throw new Error(`Chain icon not found for blockchain: ${supportedBlockchain}`)
            }

            return {
              value: wallet.address,
              label: wallet.name || 'Unknown', // Provide a default value if wallet name is not available
              address: wallet.address,
              chainId: supportedBlockchain,
              supportedBlockchains: wallet.supportedBlockchains,
              metadata: {
                id: wallet.id || 'Unknown', // Provide a default value if wallet ID is not available
                type: 'wallet'
              }
            }
          })
      }) || []

    return [...recipientEntries, ...walletEntries]
  }, [contacts, wallets, selectedChain?.id, chainIcons])

  const chartOfAccountsOptions = useMemo(
    () => [
      {
        value: null,
        label: 'No Account'
      },
      ...chartOfAccounts
    ],
    [chartOfAccounts]
  )

  const tagOptions = useMemo(() => tags?.map((_tag) => ({ value: _tag.id, label: _tag.name })) || [], [tags])

  const currenciesOptions: { value: string; label: string; src: string }[] = useMemo(
    () =>
      fiatCurrencies?.map((currencyVal) => ({
        value: currencyVal.code,
        label: currencyVal.code,
        src: getCurrencyImage(currencyVal.code)
      })),
    [fiatCurrencies]
  )

  const purposeOfTransferOptions = Object.values(PurposeOfRemittance)
    .map((item) => ({
      value: item,
      label: _.startCase(_.toLower(item))
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return {
    chartOfAccountsOptions,
    currenciesOptions,
    selectedSource,
    sourcesTotalBasedOnChain:
      currencyType === CurrencyType.FIAT
        ? sourcesTotalBasedOnChain?.filter((source) => source.type !== SourceType.GNOSIS)
        : sourcesTotalBasedOnChain,
    isSourcesLoading: isLoading,
    tokenOptions,
    contactOptions,
    tagOptions,
    purposeOfTransferOptions
  }
}

export default useCreatePayment
