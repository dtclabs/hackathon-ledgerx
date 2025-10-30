/* eslint-disable react/no-array-index-key */
import { FC } from 'react'
import Image from 'next/legacy/image'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { formatNumberWithCommasBasedOnLocale, formatNumberString } from '@/utils-v2/numToWord'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import TextField from '@/components/TextField/TextField'
import CloseIconHover from '@/public/svg/icons/close-icon-hover.svg'
import ReactTooltip from 'react-tooltip'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { calculateInvoiceTotalByTax, calculateInvoiceItemByTax } from '../invoice-utils'

interface ICreateInvoiceTable {
  fields: any
  append: any
  remove: any
  control
  handleOnChange: any
  setValue: any
  errors: any
  fiatCurrencySetting: {
    code: string
  }
  countryIso: string
  watch: any
  getValues: any
  taxType: string
}

const CreateInvoiceTable: FC<ICreateInvoiceTable> = ({
  fields,
  append,
  watch,
  remove,
  control,
  setValue,
  handleOnChange,
  errors,
  fiatCurrencySetting,
  countryIso,
  getValues,
  taxType
}) => {
  const items = getValues('invoiceItems')
  const invoiceTotal = calculateInvoiceTotalByTax(items, taxType)

  const handleRemoveIndex = (index) => () => {
    if (index === 0 && fields.length === 1) {
      setValue(`invoiceItems[${index}].name`, '')
      setValue(`invoiceItems[${index}].quantity`, 1)
      setValue(`invoiceItems[${index}].amount`, '')
      setValue(`invoiceItems[${index}].tax`, 0)
    } else {
      remove(index)
    }
  }

  return (
    <BaseTable>
      <BaseTable.Header>
        <BaseTable.Header.Row>
          <BaseTable.Header.Row.Cell>Item</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>
            <div className="min-w-[140px]">Qty</div>
          </BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>Unit Price</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>Tax(%)</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell colSpan={2}>Total Amount</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>{}</BaseTable.Header.Row.Cell>
        </BaseTable.Header.Row>
      </BaseTable.Header>
      <BaseTable.Body>
        {fields.map((field, index) => {
          const invoiceItemTotal = formatNumberWithCommasBasedOnLocale(
            String(
              calculateInvoiceItemByTax({
                quantity: watch(`invoiceItems[${index}].quantity`),
                unitPrice: watch(`invoiceItems[${index}].amount`),
                taxType: watch('tax'),
                tax: watch(`invoiceItems[${index}].tax`)
              })
            ),
            countryIso
          )
          const trimmedInvoiceItemTotal =
            invoiceItemTotal.length > 10 ? `${invoiceItemTotal.slice(0, 10)}...` : invoiceItemTotal

          const parsedAmount = formatNumberString(watch(`invoiceItems[${index}].amount`))

          const quantityWidth = String(watch(`invoiceItems[${index}].quantity`)).length * 8 + 35 || 30

          return (
            <BaseTable.Body.Row key={index}>
              <BaseTable.Body.Row.Cell>
                <TextField
                  data-tip={`invoiceItems[${index}].name`}
                  data-for={`invoiceItems[${index}].name`}
                  onChange={handleOnChange}
                  value={watch(`invoiceItems[${index}].name`)}
                  extendInputClassName={`h-[36px] w-full ${
                    errors?.invoiceItems?.[index]?.name ? '!border-red-300' : ''
                  } `}
                  name={`invoiceItems[${index}].name`}
                  placeholder="Enter item name"
                />
                {errors?.invoiceItems?.[index]?.name && (
                  <ReactTooltip
                    id={`invoiceItems[${index}].name`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="w-[200px] !px-[10px]"
                  >
                    <Typography color="error" variant="caption">
                      {errors?.invoiceItems?.[index]?.name && errors?.invoiceItems?.[index]?.name.message}
                    </Typography>
                  </ReactTooltip>
                )}
              </BaseTable.Body.Row.Cell>
              <BaseTable.Body.Row.Cell>
                <TextField
                  onChange={handleOnChange}
                  type="text"
                  value={watch(`invoiceItems[${index}].quantity`)}
                  data-tip={`invoiceItems[${index}].quantity`}
                  data-for={`invoiceItems[${index}].quantity`}
                  style={{ width: quantityWidth, minWidth: 45, maxWidth: 120 }}
                  extendInputClassName={`h-[36px] ${errors?.invoiceItems?.[index]?.quantity ? '!border-red-300' : ''} `}
                  name={`invoiceItems[${index}].quantity`}
                  errorClass="pt-8"
                  placeholder="#"
                />
                {errors?.invoiceItems?.[index]?.quantity && (
                  <ReactTooltip
                    id={`invoiceItems[${index}].quantity`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="w-[200px] !px-[10px]"
                  >
                    <Typography color="error" variant="caption">
                      {errors?.invoiceItems?.[index]?.quantity && errors?.invoiceItems?.[index]?.quantity.message}
                    </Typography>
                  </ReactTooltip>
                )}
              </BaseTable.Body.Row.Cell>
              <BaseTable.Body.Row.Cell>
                <TextField
                  data-tip={`invoiceItems[${index}].amount`}
                  data-for={`invoiceItems[${index}].amount`}
                  onChange={handleOnChange}
                  value={parsedAmount}
                  extendInputClassName={`h-[36px] w-[150px] ${
                    errors?.invoiceItems?.[index]?.amount ? '!border-red-300' : ''
                  } `}
                  name={`invoiceItems[${index}].amount`}
                  placeholder="Enter unit price"
                />
                {errors?.invoiceItems?.[index]?.amount && (
                  <ReactTooltip
                    id={`invoiceItems[${index}].amount`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="w-[200px] !px-[10px]"
                  >
                    <Typography color="error" variant="caption">
                      {errors?.invoiceItems?.[index]?.amount && errors?.invoiceItems?.[index]?.amount.message}
                    </Typography>
                  </ReactTooltip>
                )}
              </BaseTable.Body.Row.Cell>
              <BaseTable.Body.Row.Cell>
                <TextField
                  data-tip={`invoiceItems[${index}].tax`}
                  data-for={`invoiceItems[${index}].tax`}
                  onChange={handleOnChange}
                  disabled={watch('tax') === '' || watch('tax') === 'none'}
                  extendInputClassName={`h-[36px] w-[100px] ${
                    errors?.invoiceItems?.[index]?.tax ? '!border-red-300' : ''
                  } `}
                  value={watch('tax') === '' || watch('tax') === 'none' ? 0 : watch(`invoiceItems[${index}].tax`)}
                  name={`invoiceItems[${index}].tax`}
                  placeholder="Enter tax..."
                />
                {errors?.invoiceItems?.[index]?.tax && (
                  <ReactTooltip
                    id={`invoiceItems[${index}].tax`}
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="w-[200px] !px-[10px]"
                  >
                    <Typography color="error" variant="caption">
                      {errors?.invoiceItems?.[index]?.tax && errors?.invoiceItems?.[index]?.tax.message}
                    </Typography>
                  </ReactTooltip>
                )}
              </BaseTable.Body.Row.Cell>
              <BaseTable.Body.Row.Cell>
                <div style={{ width: 200 }}>
                  {invoiceItemTotal?.length > 10 ? (
                    <Tooltip
                      position={ETooltipPosition.TOP}
                      shortText={
                        <Typography>
                          {fiatCurrencySetting?.code} {trimmedInvoiceItemTotal ?? '-'}
                        </Typography>
                      }
                      text={<Typography variant="caption">{invoiceItemTotal}</Typography>}
                    />
                  ) : (
                    <Typography>
                      {fiatCurrencySetting?.code} {trimmedInvoiceItemTotal}
                    </Typography>
                  )}
                </div>
              </BaseTable.Body.Row.Cell>
              <BaseTable.Body.Row.Cell>
                <div className="w-[25px]">
                  <Image
                    onClick={handleRemoveIndex(index)}
                    className="cursor-pointer"
                    src={CloseIconHover}
                    height="20"
                    width="20"
                  />
                </div>
              </BaseTable.Body.Row.Cell>
            </BaseTable.Body.Row>
          )
        })}
        <BaseTable.Body.Row>
          <BaseTable.Body.Row.Cell colSpan="6">
            <div>
              <Button
                leadingIcon={<Image src={AddIcon} height={12} width={12} />}
                onClick={() => append({ item: '', quantity: 1, unitPrice: '', tax: 0, totalAmount: '' })}
                height={32}
                label="Add new line"
                variant="ghost"
              />
            </div>
          </BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
        <BaseTable.Body.Row>
          <BaseTable.Body.Row.Cell colSpan="6">
            <div className="flex justify-end ">
              <div className="flex flex-row ">
                <div className="flex flex-col items-end">
                  <div className="p-4">
                    <Typography>Subtotal</Typography>
                  </div>
                  <div className="p-4">
                    <Typography>
                      {!getValues('tax') || getValues('tax') === 'none'
                        ? 'Tax'
                        : getValues('tax') === 'inclusive'
                        ? 'Tax Inclusive'
                        : 'Tax Exclusive'}
                    </Typography>
                  </div>
                  <div className=" bg-[#FBFAFA] p-4">
                    <Typography styleVariant="semibold">Total</Typography>
                  </div>
                </div>
                <div>
                  <div className="p-4">
                    <Typography>
                      {fiatCurrencySetting?.code}{' '}
                      {formatNumberWithCommasBasedOnLocale(String(invoiceTotal.subtotal), countryIso)}{' '}
                    </Typography>
                  </div>
                  <div className="p-4">
                    <Typography>
                      {fiatCurrencySetting?.code}{' '}
                      {formatNumberWithCommasBasedOnLocale(String(invoiceTotal.taxTotal), countryIso)}{' '}
                    </Typography>
                  </div>
                  <div className=" bg-[#FBFAFA] p-4">
                    <Typography styleVariant="semibold">
                      {fiatCurrencySetting?.code}{' '}
                      {formatNumberWithCommasBasedOnLocale(String(invoiceTotal.total), countryIso)}{' '}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
      </BaseTable.Body>
    </BaseTable>
  )
}

export default CreateInvoiceTable
