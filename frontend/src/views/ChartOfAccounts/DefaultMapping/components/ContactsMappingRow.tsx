/* eslint-disable no-else-return */
import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { Badge } from '@/components-v2/molecules/Badge'
import ArrowIcon from '@/public/svg/icons/arrow-left.svg'
import Image from 'next/legacy/image'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import ReactTooltip from 'react-tooltip'
import _ from 'lodash'
import FormatCoAOptionLabel from './FormatCoAOptionLabel/FormatCoAOptionLabel'
import ContactIconSingle from '@/public/svg/icons/contact-icon-single-light.svg'
import ContactIconGroup from '@/public/svg/icons/contact-icon-group-light.svg'
import InformationIcon from '@/public/svg/icons/info-icon-circle-black.svg'
import { ChartOfAccountMappingType } from '@/api-v2/chart-of-accounts-mapping'
import { useAppSelector } from '@/state'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import DisplayContactDetails from './DisplayContactDetails/DisplayContactDetails'
import { IRecipientAddress } from '@/slice/contacts/contacts.types'

interface IFeesSectionProps {
  index: any
  onClickMapping?: () => void
  onChangeAccount?: (id: string, value: any) => void
  accountFrom: any
  accountTo: any
  //   onChangeAccountFrom?: (id: string, value: any) => void
  title: string
  organizationType: string
  txCount?: number
  onClickAddCustomMapping?: any
  options?: any[]
  account?: any
  disableMapping?: boolean
  tooltipCopy?: string
  selectedAccountOption?: {
    value: string
    label: string
  }
  recipientAddresses?: IRecipientAddress[]
}

const ContactMappingRow: FC<IFeesSectionProps> = ({
  index,
  onChangeAccount,
  accountFrom,
  accountTo,
  organizationType,
  title,
  txCount,
  options = [],
  account,
  recipientAddresses
}) => {
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)

  const handleChangeAccount = (value: any) => (x) => {
    if (value === 'incoming') {
      onChangeAccount(accountFrom?.id, x)
    } else {
      onChangeAccount(accountTo?.id, x)
    }
  }

  const handleDisabled = (_option) => {
    if (_option.relatedMapping?.type === ChartOfAccountMappingType.RECIPIENT) {
      return false
    }

    return _option.disabled
  }
  const parsedOptions = useMemo(() => {
    const groupedAccounts = options?.map((option) => ({
      ...option,
      options: option?.options.map((item) => ({
        ...item,
        disabled: handleDisabled(item),
        isSelected: item.value === account
      }))
    }))

    return [
      {
        value: null,
        label: 'No Account'
      },
      ...groupedAccounts
    ]
  }, [options, account])

  const selectedAccounts = useMemo(
    () => ({
      incoming: chartOfAccounts.find((item) => item.value === accountFrom?.chartOfAccount?.id),
      outgoing: chartOfAccounts.find((item) => item.value === accountTo?.chartOfAccount?.id)
    }),
    [accountFrom?.chartOfAccount?.id, accountTo?.chartOfAccount?.id, chartOfAccounts]
  )

  return (
    <div className="flex flex-row gap-6 laptop:gap-4 justify-between">
      <div className="basis-2/6 min-w-[350px] laptop:min-w-[300px]">
        <div className={`flex flex-row items-center gap-2 pt-2 ${index === 0 ? 'mt-14' : ''}`}>
          <Image height={30} width={30} src={organizationType ? ContactIconGroup : ContactIconSingle} alt="contact" />
          <div>
            <Typography variant="body2" classNames="font-semibold w-80 laptop:w-[270px] truncate" color="primary">
              {title}
            </Typography>
            <DisplayContactDetails recipientAddresses={recipientAddresses} />
          </div>
          {txCount && <Badge text={`${txCount} transactions`} variant="rounded-outline" color="white" size="small" />}
        </div>
      </div>
      <div className={`p-4 flex justify-center items-center min-w-[50px] ${index === 0 ? 'mt-14' : ''}`}>
        <Image className="transform -scale-x-100" src={ArrowIcon} width={16} height={16} />
      </div>
      <div className="flex-1 flex flex-col basis-1/6">
        {index === 0 && (
          <div className="bg-[#F9FAFB] p-2 rounded-md mb-4 flex flex-row gap-2 items-center">
            <Typography variant="body2">Incoming</Typography>
            <div className="cursor-pointer mt-1" data-tip="incoming-icon" data-for="incoming-icon">
              <Image src={InformationIcon} height={15} width={15} />
            </div>
            <ReactTooltip
              id="incoming-icon"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              All transactions made <span className="font-bold">from</span> this user will
              <br /> be automatically mapped to this account.
            </ReactTooltip>
          </div>
        )}
        <div className="w-80 laptop:w-[280px]">
          <Dropdown
            placeholder="Select account"
            sizeVariant="medium"
            id="incoming"
            options={parsedOptions}
            showCaret
            isSearchable
            onChange={handleChangeAccount('incoming')}
            value={selectedAccounts.incoming || null}
            formatOptionLabel={FormatCoAOptionLabel}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col  basis-1/6">
        {index === 0 && (
          <div className="bg-[#F9FAFB] p-2 rounded-md mb-4 flex flex-row gap-2 items-center">
            <Typography variant="body2">Outgoing</Typography>
            <div className="cursor-pointer mt-1" data-tip="outgoing-icon" data-for="outgoing-icon">
              <Image src={InformationIcon} height={15} width={15} />
            </div>
            <ReactTooltip
              id="outgoing-icon"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              All transactions made <span className="font-bold">to</span> this user will
              <br /> be automatically mapped to this account.
            </ReactTooltip>
          </div>
        )}
        <div className="w-80 laptop:w-[280px]">
          <Dropdown
            placeholder="Select account"
            sizeVariant="medium"
            id="outgoing"
            options={parsedOptions}
            showCaret
            isSearchable
            onChange={handleChangeAccount('outgoing')}
            value={selectedAccounts.outgoing || null}
            formatOptionLabel={FormatCoAOptionLabel}
          />
        </div>
      </div>
    </div>
  )
}

export default ContactMappingRow
