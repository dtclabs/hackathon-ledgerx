import { FC } from 'react'
import ReactTooltip from 'react-tooltip'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import Button from '@/components-v2/atoms/Button'
import { useAppSelector } from '@/state'
import Typography from '@/components-v2/atoms/Typography'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { Badge2 as Badge } from '@/components-v2/molecules/Badge'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { TokenFiatPricing } from '@/components-v2/molecules/TokenFiatPricing'
import DTCLogo from '@/public/svg/logos/dtcpay-circle-logo.svg'
import { capitalize } from 'lodash'

import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { STATUS_COLOR_MAP, INVOICE_STATUS_MAP, SETTLEMENT_STATUS } from '../../invoice-utils'
import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import MoreAction from '@/public/svg/MoreAction.svg'
import Image from 'next/legacy/image'

interface IAddressBookTableRow {
  data: any
  onClickCopyButton?: (value: string) => void
  onClickDeactivate?: (value: string) => void
  onClickSync?: (value: string, invoiceNumber: string) => void
  currency: string
}

const InvoiceTableRow: FC<IAddressBookTableRow> = ({
  data,
  onClickSync,
  onClickCopyButton,
  onClickDeactivate,
  currency
}) => {
  const {
    timezone: timeZonesetting,
    country: countrySetting
    // fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)

  const handleOnClick = (e) => {
    e.stopPropagation()
    onClickCopyButton(data?.original)
  }

  const handleOnClickAction = (_action) => {
    if (_action.value === 'sync') {
      onClickSync(data?.original?.id, data?.original?.invoiceNumber)
    } else if (_action.value === 'deativate') {
      onClickDeactivate(data?.original?.id)
    }
  }

  const invoiceStatus = INVOICE_STATUS_MAP[data?.original?.invoiceStatus]
  const settlementStatus = SETTLEMENT_STATUS[data?.original?.settlementStatus]
  const isDisabled = data?.original?.invoiceStatus === 'cancelled' || data?.original?.invoiceStatus === 'paid'
  const ACTION_DROPDOWN = [
    {
      value: 'sync',
      label: 'Sync',

      className: 'text-xs leading-4 font-normal  py-[6px] w-[120px]'
    },
    {
      value: 'deativate',
      label: 'Void',
      disabled: isDisabled,
      className: 'text-xs leading-4 font-normal text-error-500 py-[6px] w-[120px]'
    }
  ]

  const renderInvoiceColumn = () => {
    if (data?.original?.invoiceNumber.length > 20 || data?.original?.payee?.length > 20) {
      return (
        <div
          data-tip={`long-invoice-tooltop-${data?.original?.invoiceNumber}`}
          data-for={`long-invoice-tooltop--${data?.original?.invoiceNumber}`}
        >
          <Typography>{data?.original?.invoiceNumber.slice(0, 20)}...</Typography>
          <Typography classNames="mt-1" variant="caption" color="secondary">
            {data?.original?.payee?.slice(0, 20)}...
          </Typography>
          <ReactTooltip
            id={`long-invoice-tooltop-${data?.original?.invoiceNumber}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            {/* <Typography>{data?.original?.invoiceNumber}</Typography>
            <Typography classNames="mt-1" variant="caption" color="secondary">
              {data?.original?.payee}
            </Typography> */}
          </ReactTooltip>
        </div>
      )
    }
    return (
      <>
        <Typography>{data?.original?.invoiceNumber}</Typography>
        <Typography classNames="mt-1" variant="caption" color="secondary">
          {data?.original?.payee}
        </Typography>
      </>
    )
  }

  return (
    <>
      <BaseTable.Body.Row.Cell extendedClass="!p-0 !pl-5 !w-[50px] ">
        <div className="flex justify-center">
          <Image className="rounded-full" src={DTCLogo} height={24} width={24} alt="invoice-logo" />
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>{renderInvoiceColumn()}</BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <Typography>
          {formatTimeBasedonUTCOffset(
            data?.original?.issueDate,
            timeZonesetting?.utcOffset || 480,
            countrySetting?.iso || 'SG',
            { year: 'numeric', month: 'short', day: 'numeric' }
          )}
        </Typography>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <Typography>
          {formatTimeBasedonUTCOffset(
            data?.original?.dueDate,
            timeZonesetting?.utcOffset || 480,
            countrySetting?.iso || 'SG',
            { year: 'numeric', month: 'short', day: 'numeric' }
          )}
        </Typography>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <TokenFiatPricing
          decimal={2}
          fiatCurrency={currency}
          cryptocurrencyImage={data?.original?.cryptocurrencyImage}
          cryptocurrencySymbol={data?.original?.cryptocurrencySymbol}
          // countryIso={countrySetting?.iso}
          countryIso="US"
          fiatAmount={data?.original?.totalAmountFiat}
          cryptocurrencyAmount={data?.original?.totalAmountToken}
        />
      </BaseTable.Body.Row.Cell>

      <BaseTable.Body.Row.Cell>
        <div className="w-[80px]">
          <Badge variant="rounded" color={STATUS_COLOR_MAP[invoiceStatus]}>
            <Badge.Label>{capitalize(invoiceStatus ?? 'pending')}</Badge.Label>
          </Badge>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell>
        <div className="w-[80px]">
          <Badge variant="rounded" color={STATUS_COLOR_MAP[settlementStatus]}>
            <Badge.Label>{capitalize(settlementStatus)}</Badge.Label>
          </Badge>
        </div>
      </BaseTable.Body.Row.Cell>
      <BaseTable.Body.Row.Cell colSpan="2 ">
        <div className="flex flex-row items-center justify-between gap-4">
          <Button
            leadingIcon={<SVGIcon name="CopyIcon" />}
            height={32}
            variant="grey"
            data-tip={`copy-link-btn-${data?.original?.id}`}
            data-for={`copy-link-btn-${data?.original?.id}`}
            onClick={handleOnClick}
            label="Copy Link"
          />
          {isDisabled && (
            <ReactTooltip
              id={`copy-link-btn-${data?.original?.id}`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              <Typography classNames="max-w-[250px]" variant="caption" color="secondary">
                This invoice has been {data?.original?.invoiceStatus}
              </Typography>
            </ReactTooltip>
          )}
          <ButtonDropdown id={data?.original?.id}>
            <ButtonDropdown.CTA
              trailingIcon={<Image src={MoreAction} alt="3 dot" width={14} height={14} />}
              variant="transparent"
              classNames="border-none"
            />
            <ButtonDropdown.Options extendedClass="!top-7" options={ACTION_DROPDOWN} onClick={handleOnClickAction} />
          </ButtonDropdown>
        </div>
      </BaseTable.Body.Row.Cell>
    </>
  )
}

export default InvoiceTableRow

// <Tooltip
// arrow={false}
// delayHide={50}
// position={ETooltipPosition.TOP}
// className="mb-[18px]"
// shortText={
//   <WalletAddress
//     split={5}
//     address={data.toAddress}
//     variant="caption"
//     color="dark"
//     styleVariant="medium"
//   />
// }
// text={
//   <div className="flex flex-row items-center gap-4 px-2 py-[2px] cursor-default">
//     <div style={{ color: '#344054' }} className="text-sm ">
//       Unknown Address
//     </div>{' '}
//     <Button
//       size="md"
//       color="tertiary"
//       onClick={(e) => {
//         e.stopPropagation()
//         handleOnClickAddContact(data.toAddress)
//       }}
//     >
//       Add To Contacts
//     </Button>
//   </div>
// }
// />
