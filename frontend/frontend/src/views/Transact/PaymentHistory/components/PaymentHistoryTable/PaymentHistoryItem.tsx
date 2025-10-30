import { CurrencyType, IPayment, ProviderStatus } from '@/api-v2/payment-api'
import Typography from '@/components-v2/atoms/Typography'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import Image from 'next/legacy/image'
import { useMemo } from 'react'
import PaymentStatusPill from './PaymentStatusPill'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { IChain } from '@/slice/platform/platform-slice'
import ReactTooltip from 'react-tooltip'

const PaymentHistoryItem = ({ item, supportedChains }: { item: IPayment; supportedChains: IChain[] }) => {
  const recipients = useAppSelector(contactsSelector)
  const wallets = useAppSelector(walletsSelector)

  const contactName = useMemo(() => {
    if (item?.destinationMetadata?.type === 'wallet') {
      const walletContact = wallets?.find((wallet) => wallet.id === item.destinationMetadata.id)
      return walletContact?.name
    }
    if (item.destinationMetadata?.type === 'recipient_address') {
      const recipientContact = recipients?.find((recipient) =>
        recipient?.recipientAddresses?.find((address) => address.publicId === item.destinationMetadata.id)
      )
      return recipientContact?.type === 'individual'
        ? recipientContact?.contactName
        : recipientContact?.organizationName
    }
    return item?.destinationName
  }, [item?.destinationMetadata, recipients, wallets])

  const renderRecipient = useMemo(() => {
    if (item?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <>
          <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
            {contactName || item?.destinationName}
          </ProfileInfoDisplay.Info.Name>
          <ProfileInfoDisplay.Info.Name
            data-tip={`full-bank-info-${item?.id}`}
            data-for={`full-bank-info-${item?.id}`}
            color="secondary"
            classNames="truncate"
            variant="caption"
          >
            {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
          </ProfileInfoDisplay.Info.Name>
          <ReactTooltip
            id={`full-bank-info-${item?.id}`}
            borderColor="#eaeaec"
            border
            place="bottom"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            <Typography>
              {item?.destinationMetadata?.bankName}-{item?.destinationMetadata?.accountNumberLast4}
            </Typography>
          </ReactTooltip>
        </>
      )
    }
    return item?.destinationName && item?.destinationMetadata?.id ? (
      <>
        <ProfileInfoDisplay.Info.Name color="primary" styleVariant="regular" classNames="truncate">
          {contactName || item?.destinationName}
        </ProfileInfoDisplay.Info.Name>
        <ProfileInfoDisplay.Info.Address
          address={item?.destinationAddress}
          color="secondary"
          variant="caption"
          blockExplorer={supportedChains?.find((chain) => chain.id === item?.blockchainId)?.blockExplorer}
        />
      </>
    ) : (
      <>
        <div className="flex flex-row items-center">
          <div data-tip={`add-contact-${item?.id}`} data-for={`add-contact-${item?.id}`}>
            <WalletAddress split={4} address={item.destinationAddress} color="primary" styleVariant="regular" />
          </div>
          <div className="flex items-center gap-[6px]">
            <WalletAddress.Link address={item.destinationAddress} isMultiple={false} />
            <WalletAddress.Copy address={item.destinationAddress} />
          </div>
        </div>
        <ProfileInfoDisplay.Info.Name color="secondary" classNames="truncate" variant="caption">
          {item?.destinationName || 'Unknown'}
        </ProfileInfoDisplay.Info.Name>
      </>
    )
  }, [
    item?.destinationMetadata,
    item?.destinationName,
    item?.destinationCurrencyType,
    item?.destinationAddress,
    contactName,
    item?.destinationName,
    item?.blockchainId
  ])

  const renderAmount = useMemo(() => {
    if (item?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            {getCurrencyImage(item?.destinationCurrency?.code) && (
              <Image src={getCurrencyImage(item?.destinationCurrency?.code)} height={18} width={18} alt="icon-amount" />
            )}
            <Typography color="primary" variant="body2" styleVariant="semibold">
              {toNearestDecimal(String(item?.destinationAmount), 'SG', 2)} {item?.destinationCurrency?.code}
            </Typography>
          </div>
          <div className="flex gap-1 items-center">
            <Typography color="secondary" variant="caption">
              You paid:
            </Typography>
            <div className="flex items-center">
              {item?.sourceCryptocurrency?.image?.small && (
                <Image src={item?.sourceCryptocurrency?.image?.small} height={14} width={14} alt="icon-amount" />
              )}
            </div>
            <Typography color="secondary" variant="caption">
              {toNearestDecimal(String(item?.sourceAmount), 'SG', 2)} {item?.sourceCryptocurrency?.symbol}
            </Typography>
          </div>
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        {item?.destinationCurrency?.image?.small && (
          <Image priority src={item?.destinationCurrency?.image?.small} height={18} width={18} alt="icon-amount" />
        )}
        <Typography color="primary" variant="body2" styleVariant="semibold">
          {item?.destinationAmount} {item?.destinationCurrency?.symbol}
        </Typography>
      </div>
    )
  }, [item])

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="truncate">
        <ProfileInfoDisplay>
          <ProfileInfoDisplay.Avatar name={item?.destinationMetadata?.id && item?.destinationName} />
          <ProfileInfoDisplay.Info classNames="w-[calc(100%-32px)] truncate">{renderRecipient}</ProfileInfoDisplay.Info>
        </ProfileInfoDisplay>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="truncate">{renderAmount}</BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="truncate">
        <Typography color="primary" variant="body2">
          {item?.sourceWallet?.name || '-'}
        </Typography>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell extendedClass="truncate">
        <PaymentStatusPill providerStatus={item?.providerStatus as ProviderStatus} />
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default PaymentHistoryItem
