/* eslint-disable no-prototype-builtins */
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import RequestLogo from '@/public/svg/icons/request-finance-icon.svg'
import SelectDropdown from '@/components-v2/Select/Select'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { currencyToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'

interface ITransactionSection {
  id: string
  currency: string
  role: 'buyer' | 'seller'
  invoiceTotal: string
  counterParty: { email: string; name: string }
  invoiceItems: { amount: string; currency: string; name: string; quantity: number }[]
  invoiceNumber: string
  invoicesOptions: { value: string; label: string }[]
  handleChangeInvoice: (option: { value: string; label: string }) => void
}

const TransactionSection: FC<ITransactionSection> = ({
  id,
  invoiceItems,
  counterParty,
  currency,
  role,
  invoiceTotal,
  invoiceNumber,
  invoicesOptions,
  handleChangeInvoice
}) => {
  const { country: countrySetting } = useAppSelector(orgSettingsSelector)

  return (
    <div className="mt-5">
      <div className="flex flex-row justify-between items-center mb-1">
        <Typography variant="caption" color="secondary">
          Invoice sent with:
        </Typography>
        <Image src={RequestLogo} width={80} height={24} alt="Picture of the author" />
      </div>
      <SelectDropdown
        className="w-full"
        name="invoices"
        onChange={handleChangeInvoice}
        options={invoicesOptions}
        value={invoicesOptions?.find((option) => option.value === invoiceNumber)}
      />
      <div className="flex flex-row justify-between items-center mt-8">
        <Typography variant="body1" color="black" styleVariant="semibold">
          Billed {role === 'seller' ? 'To' : 'From'}:
        </Typography>
      </div>
      <div className="flex flex-row justify-between items-center mt-2">
        <Typography variant="body2" color="black">
          {counterParty?.name}
        </Typography>
      </div>
      <div className="flex flex-row justify-between items-center mt-2">
        <Typography variant="body2" color="secondary">
          {counterParty?.email}
        </Typography>
      </div>
      <div className="flex flex-col justify-center mt-8">
        <Typography variant="body1" color="black" styleVariant="semibold">
          Invoice Summary
        </Typography>
        <div className="w-full border border-solid rounded-lg mt-3 box-border">
          {invoiceItems?.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="w-full p-4" key={`${id}-${index}`}>
              <div className="w-full mt-1 flex justify-between">
                <div className="w-[70%] flex justify-between ">
                  <Typography variant="body2" color="black" styleVariant="regular" classNames="break-all">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="black" styleVariant="regular" classNames="pl-4">
                    {`x${item.quantity}`}
                  </Typography>
                </div>
                <div className="max-w-[30%]">
                  <Typography variant="caption" color="primary" data-tip={`${id}-${index}`} data-for={`${id}-${index}`}>
                    {`${item.currency} ${currencyToWord(
                      item.amount.toString(),
                      CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                      countrySetting?.iso,
                      2
                    )}`}
                  </Typography>
                  <ReactTooltip
                    id={`${id}-${index}`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    className="!opacity-100 !rounded-lg"
                  >
                    {`${item.currency} ${formatNumberWithCommasBasedOnLocale(
                      item.amount.toString(),
                      countrySetting?.iso
                    )}`}
                  </ReactTooltip>
                </div>
              </div>
            </div>
          ))}

          <div className="w-full flex flex-row justify-between items-center p-4 border-t">
            <Typography variant="body2" color="black" styleVariant="regular">
              Total
            </Typography>
            <Typography
              variant="caption"
              color="black"
              styleVariant="semibold"
              data-tip={`${id}-total-amount`}
              data-for={`${id}-total-amount`}
            >
              {`${currency} ${currencyToWord(
                invoiceTotal,
                CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                countrySetting?.iso,
                2
              )}`}
            </Typography>
            <ReactTooltip
              id={`${id}-total-amount`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {/* {`${currency} ${invoiceItems?.reduce((acc, cur) => acc + cur.quantity * +cur.amount, 0).toString()}`} */}
              {`${currency} ${formatNumberWithCommasBasedOnLocale(invoiceTotal, countrySetting?.iso)}`}
            </ReactTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionSection
