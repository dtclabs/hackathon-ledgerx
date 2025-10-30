import { IPreviewFileRequest, useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import { CurrencyType, IPayment, ProviderStatus } from '@/api-v2/payment-api'
import { Divider } from '@/components-v2/Divider'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DownloadIcon from '@/public/svg/Download.svg'
import ContactIcon from '@/public/svg/icons/contact-unknown-avatar.svg'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import { extractNameFromUUIDString } from '@/utils-v2/string-utils'
import { getCurrencyImage } from '@/views/CreateDraftPayment/hooks/useDraftForm/useDraftForm'
import Avvvatars from 'avvvatars-react'
import Image from 'next/legacy/image'
import { useMemo } from 'react'
import PaymentStatusPill from '../PaymentHistoryTable/PaymentStatusPill'
import { toShort } from '@/utils/toShort'

interface IOverviewProps {
  data: IPayment
  settings: any
  cryptocurrencyPrice: string | null
}

const OverviewTab: React.FC<IOverviewProps> = ({ data, settings, cryptocurrencyPrice }) => {
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  const [triggerDownload] = useLazyDownloadTxFileQuery()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  const handleDownloadFile = (file: IPreviewFileRequest) => {
    if (file?.key) triggerDownload({ filename: file.filename, key: file.key })
  }

  const handlePreviewFile = (file: IPreviewFileRequest) => {
    if (file?.key) {
      triggerPreviewFile({ key: file.key, filename: file.filename })
    }
  }

  const parsedFiles: IPreviewFileRequest[] = data?.files?.map((file) => {
    const result = extractNameFromUUIDString(file)

    if (result.isSuccess) {
      return {
        key: file,
        filename: result.data.fileName
      }
    }
    return {
      key: '',
      filename: ''
    }
  })

  const amountSection = useMemo(() => {
    if (data?.destinationCurrencyType === CurrencyType.FIAT) {
      return (
        <section className="flex flex-col gap-3 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Amount
          </Typography>

          <div className="flex flex-col gap-2">
            <Typography styleVariant="semibold" variant="caption" color="secondary">
              You Paid
            </Typography>
            <CryptoFiatInfoDisplay
              classNames="flex gap-2 w-fit"
              iso={settings?.country?.iso}
              cryptocurrency={{
                image: data?.sourceCryptocurrency?.image?.small,
                amount: data?.sourceAmount || '0',
                symbol: data?.sourceCryptocurrency?.symbol
              }}
              fiatcurrency={{
                iso: settings?.country?.iso,
                currencyCode: settings?.fiatCurrency?.code,
                currencySymbol: settings?.fiatCurrency?.symbol,
                fiatAmount: String(
                  Boolean(cryptocurrencyPrice) && data?.sourceAmount
                    ? parseFloat(cryptocurrencyPrice) * parseFloat(data?.sourceAmount)
                    : 0
                ),
                color: 'secondary'
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography styleVariant="semibold" variant="caption" color="secondary">
              Recipient Gets
            </Typography>
            <CryptoFiatInfoDisplay
              classNames="flex gap-2 w-fit"
              iso={settings?.country?.iso}
              cryptocurrency={{
                image: getCurrencyImage(data?.destinationCurrency?.code),
                amount: data?.destinationAmount || '0',
                symbol: data?.destinationCurrency?.code
              }}
            />
          </div>
        </section>
      )
    }

    return (
      <section className="flex flex-col gap-2 mb-6">
        <Typography styleVariant="semibold" color="secondary">
          Amount
        </Typography>

        <CryptoFiatInfoDisplay
          classNames="flex gap-2 w-fit"
          iso={settings?.country?.iso}
          cryptocurrency={{
            image: data?.destinationCurrency?.image?.small,
            amount: data?.destinationAmount || '0',
            symbol: data?.destinationCurrency?.symbol
          }}
          fiatcurrency={{
            iso: settings?.country?.iso,
            currencyCode: settings?.fiatCurrency?.code,
            currencySymbol: settings?.fiatCurrency?.symbol,
            fiatAmount: String(
              Boolean(cryptocurrencyPrice) && data?.destinationAmount
                ? parseFloat(cryptocurrencyPrice) * parseFloat(data.destinationAmount)
                : 0
            ),
            color: 'secondary'
          }}
        />
      </section>
    )
  }, [data, cryptocurrencyPrice])

  return (
    <div className="pt-4">
      <div className="flex flex-col grow">
        <section className="flex flex-row items-center justify-between mb-7">
          <Typography styleVariant="semibold" color="secondary">
            Status
          </Typography>
          <PaymentStatusPill providerStatus={data?.providerStatus as ProviderStatus} />
        </section>
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Recipient
          </Typography>
          <div className="flex items-center gap-2 h-10">
            {data?.destinationMetadata?.id ? (
              <Avvvatars value={data?.destinationName} size={24} />
            ) : (
              <Image src={ContactIcon} alt="contact-icon" height={24} width={24} />
            )}
            <Typography classNames="truncate max-w-[calc(100%-110px)]" color="dark">
              {data?.destinationName || 'Unknown'}
            </Typography>
            <DividerVertical space="mx-0" height="h-5" />
            {data?.destinationCurrencyType === CurrencyType.FIAT ? (
              <Typography color="secondary" classNames="truncate">
                {data?.destinationMetadata?.bankName}-{data?.destinationMetadata?.accountNumberLast4}
              </Typography>
            ) : (
              <WalletAddress address={data?.destinationAddress}>
                <WalletAddress.Link address={data?.destinationAddress} isMultiple={false} />
                <WalletAddress.Copy address={data?.destinationAddress} />
              </WalletAddress>
            )}
          </div>
        </section>
        {amountSection}
        <section className="flex flex-row justify-between items-center">
          <Typography styleVariant="semibold" color="secondary" classNames="flex-1">
            Sent From
          </Typography>
          <Typography color="black" classNames="">
            {data?.sourceWallet?.name || '-'}
          </Typography>
        </section>
        <Divider />
        <Typography styleVariant="semibold" color="black" classNames="mb-6 my-2">
          Additional Information
        </Typography>
        <section className="flex flex-row justify-between items-center mb-6">
          <Typography styleVariant="semibold" color="secondary" classNames="flex-1">
            Account
          </Typography>
          <Typography color="black" classNames="">
            {`${data?.chartOfAccount?.code ? `${data?.chartOfAccount?.code} -` : ''}  ${
              data?.chartOfAccount?.name || '-'
            }`}
          </Typography>
        </section>
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Notes
          </Typography>
          <Typography color="black" classNames="">
            {data?.notes || 'No Notes'}
          </Typography>
        </section>
        <section className="flex flex-col gap-2 mb-6">
          <Typography styleVariant="semibold" color="secondary">
            Files
          </Typography>
          {parsedFiles?.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {parsedFiles.map((file, _index) => (
                <Button
                  key={file.key}
                  width="w-full"
                  trailingIcon={
                    <div className="flex items-center shrink-0">
                      {file?.key && (
                        <Image
                          src={DownloadIcon}
                          alt="download"
                          height={14}
                          width={14}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadFile(file)
                          }}
                        />
                      )}
                    </div>
                  }
                  classNames="gap-4 justify-between"
                  height={32}
                  variant="grey"
                  label={
                    <Typography classNames="truncate">
                      {file.filename?.length < 45 ? file.filename : toShort(file.filename, 30, 15)}
                    </Typography>
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreviewFile(file)
                  }}
                />
              ))}
            </div>
          ) : (
            <Typography color="black" classNames="">
              No files
            </Typography>
          )}
        </section>
        {isAnnotationEnabled && (
          <section className="flex flex-col gap-2 mb-6">
            <Typography styleVariant="semibold" color="secondary">
              Tags
            </Typography>
            {data?.annotations?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {data.annotations.map((tag) => (
                  <TagItem key={tag.name} tag={{ value: tag.id, label: tag.name }} />
                ))}
              </div>
            ) : (
              <Typography color="black" classNames="">
                No tags
              </Typography>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default OverviewTab
