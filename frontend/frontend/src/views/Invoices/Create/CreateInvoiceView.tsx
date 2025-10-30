/* eslint-disable prefer-destructuring */
import Image from 'next/legacy/image'
import Link from 'next/link'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import { Divider } from '@/components-v2/Divider'
import Typography from '@/components-v2/atoms/Typography'
import { useForm, useFieldArray } from 'react-hook-form'
import { Dropdown } from '@/components-v2/molecules/Forms'
import { addDays, isSameDay } from 'date-fns'
import * as Yup from 'yup'
import { useGetCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { useAppSelector } from '@/state'
import { yupResolver } from '@hookform/resolvers/yup'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import EyeIcon from '@/public/svg/icons/eye-icon.svg'
import TextField from '@/components/TextField/TextField'
import ReactTooltip from 'react-tooltip'
import { useOrganizationId } from '@/utils/getOrganizationId'
import DtcpayCircleLogo from '@/public/svg/logos/dtcpay-circle-logo.svg'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import ReactCountryFlag from 'react-country-flag'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useGetOrganizationIntegrationQuery } from '@/api-v2/organization-integrations'
import { useCreateInvoiceMutation } from '@/api-v2/invoices-api'
import { InvoiceDetailModal, CancelCreateModal } from '../components'
import { DateTimePicker } from '@/components-v2/DateTimePicker'
import CreateInvoiceTable from './CreateInvoiceTable'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { calculateInvoiceTotalByTax, INVOICE_SESSION_STORAGE } from '../invoice-utils'
import { IInvoicePreviewProps } from '../components/InvoiceDetailModal'
import { IInvoiceItem } from '@/slice/invoices/invoice.types'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { CreatableSelect } from '@/components/CreatableSelect/CreatableSelect'

type InvoiceWithoutTax = Omit<IInvoiceItem, 'tax'>
export type InvoiceWithTax = InvoiceWithoutTax & { tax: any }

interface IFormState {
  to: string
  invoiceNumber: string
  issuedDate: string
  dueDate: string
  paymentMethod: string
  notes: string
  linkExpiry: string
  invoiceItems: InvoiceWithTax[]
  tax: string
  fromName: string
  fromAddress: string
}

const scrollToFirstErrorField = () => {
  const errorField = document.querySelector('.text-red-400')

  if (errorField) {
    errorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const validationSchema = Yup.object().shape({
  to: Yup.string()
    .required('Please enter a recipient')
    .trim() // Trim leading and trailing whitespace
    .test('no-whitespace', 'Value must not be just whitespace', (value) => !!value && value.trim() !== ''),
  invoiceNumber: Yup.string()
    .required('Please enter an invoice number')
    .matches(/^[a-zA-Z0-9\-/_]+$/, 'Only alphanumerics and special characters allowed E.g (- / _)')
    .trim() // Trim leading and trailing whitespace
    .test('no-whitespace', 'Value must not be just whitespace', (value) => !!value && value.trim() !== ''),
  issuedDate: Yup.date()
    .required('Please enter an Issued Date')
    .max(Yup.ref('dueDate'), 'Issued Date must be before Due Date')
    .test('not-same-day', 'Issued Date cannot be the same as Due Date', (value, context) => {
      const dueDate = context.parent.dueDate
      return !isSameDay(dueDate, value)
    })
    .typeError('Please enter an Issued Date'),
  dueDate: Yup.date()
    .min(Yup.ref('issuedDate'), 'Due Date should at least be 1 day after Issued Date')

    .test('not-same-day', 'Due Date cannot be the same as Issued Date', (value, context) => {
      const issuedDate = context.parent.issuedDate
      return !isSameDay(issuedDate, value)
    })
    .typeError('Please enter a Due Date')
    .required('Please enter a Due Date'),
  tax: Yup.string().required('Please select a tax option'),
  invoiceItems: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required('Please enter an item name')
        .trim() // Trim leading and trailing whitespace
        .test('no-whitespace', 'Please enter an item name', (value) => !!value && value.trim() !== ''),
      quantity: Yup.string()
        .required('Please enter a quantity')
        // .matches(/^[0-9]*$/, 'Only numbers are allowed')
        .test('not-zero', 'Quantity must be greater than 0', (value) => parseInt(value) !== 0)
        .nullable(),
      amount: Yup.string()
        .required('Please enter a unit price')
        .test('not-zero', 'Unit price must be greater than 0', (value) => parseFloat(value) !== 0)
        // .test('invalid-format', 'Unit price only be numbers and 1 decimal', (value) => {
        //   console.log('VALUE: ', value)
        //   return true
        // }),
        .matches(/^[0-9]+(\.[0-9]+)?$/, 'Invalid amount format'),
      tax: Yup.number()
        .typeError('Only numbers are allowed')
        .max(100, 'Tax can not be greater than 100%')
        .test('is-decimal', 'Only numbers with up to 2 decimal places are allowed', (value) => {
          if (!value) return true // Allow empty input
          return /^[0-9]*(\.[0-9]{1,2})?$/.test(String(value))
        })
    })
  )
})

const CreateInvoiceView = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const [toContactSearch, setToContactSearch] = useState('')
  const [isInit, setIsInit] = useState(false)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const { data: integrationData } = useGetOrganizationIntegrationQuery({ organizationId, integrationName: 'dtcpay' })
  const [triggerCreateInvoice, createInvoiceApi] = useCreateInvoiceMutation()
  const showBanner = useAppSelector(showBannerSelector)
  const previewModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const cancelCreateModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const { data: cryptoCurrencies } = useGetCryptoCurrenciesQuery({})

  const { data: contacts, isLoading: isContactsLoading } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        search: toContactSearch,
        size: 20
      }
    },
    { skip: !organizationId }
  )

  const breadcrumbItems = [
    { to: `/${organizationId}/invoices`, label: 'Invoices' },
    { to: `/${organizationId}/invoices/create`, label: 'Create Invoice' }
  ]

  // useEffect(() => {
  //   if (!subscriptionPlan?.organizationIntegrationAddOns?.dtcpay) {
  //     router.push(`/${organizationId}/invoices`)
  //   } else {
  //     setIsInit(true)
  //   }
  // }, [subscriptionPlan])

  useEffect(() => {
    setIsInit(true)
  }, [])

  const {
    handleSubmit,
    watch,
    trigger,
    control,
    reset,
    getValues,
    formState: { errors, isSubmitting },
    setValue,
    setError
  } = useForm<IFormState>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      to: '',
      invoiceNumber: '',
      issuedDate: '',
      dueDate: '',
      notes: '',
      tax: '',
      fromName: '',
      fromAddress: '',
      invoiceItems: [
        {
          name: '',
          quantity: 1,
          amount: '',
          tax: 0
        }
      ]
    }
  })

  useEffect(() => {
    if (createInvoiceApi.isSuccess) {
      toast.success('Invoice created successfully')
      window.sessionStorage.setItem(INVOICE_SESSION_STORAGE.CREATED, createInvoiceApi?.data?.data?.id)
      window.sessionStorage.setItem(
        INVOICE_SESSION_STORAGE.CREATED_INVOICE_NUMBER,
        createInvoiceApi?.data?.data?.invoiceNumber
      )
      router.push(`/${organizationId}/invoices`)
    } else if (createInvoiceApi.isError) {
      const errorMessage = createInvoiceApi?.error?.data?.message

      if (errorMessage.includes('This invoice number has already been used.')) {
        setError('invoiceNumber', { message: 'This invoice number has already been used.' })
      } else {
        toast.error(errorMessage ?? 'Sorry, there was an an error creating the invoice')
      }
    }
  }, [createInvoiceApi])

  useEffect(() => {
    scrollToFirstErrorField()
  }, [errors])

  useEffect(() => {
    if (integrationData?.metadata) {
      if (!getValues('fromName')) setValue('fromName', integrationData?.metadata?.companyName || '')
      if (!getValues('fromAddress')) setValue('fromAddress', integrationData?.metadata?.address?.address || '')
    }
  }, [integrationData])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoiceItems'
  })

  const onClickSubmit = () => {
    const { invoiceNumber, to, invoiceItems, notes, dueDate, issuedDate, fromName, fromAddress } = getValues()
    const invoiceTotal = calculateInvoiceTotalByTax(invoiceItems, getValues('tax'))
    const taxType = getValues('tax')

    // TEMPORARY: store invoice in sessionStorage instead of hitting API
    const current = JSON.parse(window.sessionStorage.getItem(INVOICE_SESSION_STORAGE.LIST) || '[]')
    const newInvoice = {
      id: `session_${Date.now()}`,
      invoiceNumber,
      issuedAt: new Date(issuedDate).toISOString(),
      expiredAt: new Date(dueDate).toISOString(),
      toMetadata: { name: to },
      fromMetadata: { name: fromName, address: fromAddress },
      totalAmount: String(invoiceTotal.total),
      sourceMetadata: {
        cryptocurrency: integrationData?.metadata?.currency,
        amount: String(invoiceTotal.total)
      },
      invoiceDetails: {
        subtotal: String(invoiceTotal.subtotal),
        taxTotal: String(Number(invoiceTotal.taxTotal).toFixed(20)),
        items: invoiceItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          amount: item.amount,
          tax: item.tax
        }))
      },
      status: 'draft',
      metadata: { settlementStatus: 'pending' }
    }
    window.sessionStorage.setItem(INVOICE_SESSION_STORAGE.LIST, JSON.stringify([...current, newInvoice]))
    window.sessionStorage.setItem(INVOICE_SESSION_STORAGE.CREATED, newInvoice.id)
    window.sessionStorage.setItem(INVOICE_SESSION_STORAGE.CREATED_INVOICE_NUMBER, newInvoice.invoiceNumber)
    router.push(`/${organizationId}/invoices`)
  }
  const onClickPreview = () => previewModalProvider.methods.setIsOpen(true)

  const handleOnChange = (e) => {
    const { value, name } = e.target

    const strippedValue = value.replace(/,/g, '')
    setValue(name, strippedValue)
    trigger(name)
  }

  const handleOnChangeTextArea = (e) => {
    const { value, name } = e.target
    setValue(name, value)
    trigger(name)
  }

  const handleDiscardForm = () => {
    cancelCreateModalProvider.methods.setIsOpen(false)
    reset()
    router.push(`/${organizationId}/invoices`)
  }

  const handleOnChangeDate = (_value) => {
    setValue('issuedDate', String(_value))
    trigger('issuedDate')
    trigger('dueDate')
  }

  const handleOnChangeDueDate = (_value) => {
    setValue('dueDate', String(_value))
    trigger('dueDate')
  }

  const handleOnChangeTax = (_value) => {
    setValue('tax', String(_value.value))
    trigger('tax')
  }

  const parsePreviewData = (_invoice): IInvoicePreviewProps => {
    const { invoiceNumber, to, notes, dueDate, issuedDate, invoiceItems, fromName, fromAddress } = getValues()

    return {
      invoiceNumber,
      fromMetadata: {
        name: fromName || integrationData?.metadata?.companyName,
        address: fromAddress || integrationData?.metadata?.address?.address
      },
      invoiceDetails: {
        items: invoiceItems
      },
      toMetadata: {
        name: to
      },
      issuedAt: issuedDate,
      expiredAt: dueDate,
      currency: integrationData?.metadata?.currency,
      notes,
      settlementStatus: ''
    }
  }

  const formatPaymentMethodOptions = (option) => (
    <div className="flex flex-row items-center gap-3">
      <Image src={DtcpayCircleLogo} alt="dtc-play-logo" className="rounded-full" height={20} width={20} />
      <Typography variant="body2">dtcpay</Typography>
    </div>
  )

  const handleRedirectToInvoiceList = () => {
    router.push(`/${organizationId}/invoices`)
  }

  if (!isInit) {
    return null
  }

  const parseContacts = () => {
    if (!contacts) return []
    return contacts?.items?.map((contact) => ({
      value: contact?.id,
      label: contact.contactName ?? contact.recipientName
    }))
  }

  const onChangeDropdownInput = (_value) => {
    setValue('to', _value.label)
    trigger('to')
  }

  const onInputChangeContacts = (_value) => {
    setToContactSearch(_value)
  }

  const renderCryptoCurrencyImage = () => {
    const selectedCryptoCurrency = cryptoCurrencies?.data?.find(
      (item) => item.symbol === integrationData?.metadata?.currency
    )
    if (!selectedCryptoCurrency) return ''

    return selectedCryptoCurrency?.image?.small
  }

  return (
    <form onSubmit={handleSubmit(onClickSubmit)} className="bg-white p-4 rounded-lg">
      <Header>
        <Header.Left>
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
          </Breadcrumb>
        </Header.Left>
        <Header.Right>
          <Button
            leadingIcon={<Image src={EyeIcon} height={15} width={15} />}
            onClick={onClickPreview}
            height={40}
            label="Preview"
            variant="ghost"
          />
        </Header.Right>
      </Header>

      <View.Content className={`${showBanner ? '!h-[calc(100vh-315px)]' : 'h-[calc(100vh-245px)]'} `}>
        <div className="flex flex-col gap-6 pt-1 min-w-[1200px]">
          <div>
            <div className="flex flex-row gap-2 items-center justify-between    mb-1">
              <div className="flex flex-row gap-2 mb-1">
                <Typography styleVariant="semibold">Payment Method</Typography>
              </div>
            </div>
            <Dropdown
              showCaret
              formatOptionLabel={formatPaymentMethodOptions}
              defaultValue={{ value: 'dtcpay', label: 'dtcpay' }}
              options={[{ value: 'dtcpay', label: 'dtcpay' }]}
            />
          </div>
          <div className="flex flex-row gap-6">
            <section id="1st-column" className="basis-1/3 h-[220px]">
              <Typography styleVariant="semibold">From</Typography>
              <div className="flex flex-col gap-4">
                <div className="flex-1 mt-2">
                  <TextField
                    placeholder="Enter address"
                    onChange={handleOnChange}
                    value={watch('fromAddress')}
                    name="fromAddress"
                  />
                </div>
                <div>
                  <Typography classNames="mb-2" styleVariant="semibold">
                    Note
                  </Typography>
                  <TextField placeholder="Note" name="notes" onChangeTextArea={handleOnChangeTextArea} />
                </div>
              </div>
            </section>
            <section id="2nd-column" className="basis-1/3">
              <div>
                <Typography classNames="mb-2" styleVariant="semibold">
                  Invoice No.
                </Typography>
                <TextField
                  placeholder="Enter an invoice number"
                  onChange={handleOnChange}
                  value={watch('invoiceNumber')}
                  name="invoiceNumber"
                />

                {errors?.invoiceNumber && (
                  <div style={{ height: 14 }}>
                    <p className="text-xs text-red-400 pl-1 pt-1">{errors?.invoiceNumber?.message}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col  relative z-50" style={{ marginTop: 16 }}>
                <Typography styleVariant="semibold" classNames="mb-2">
                  To
                </Typography>

                <CreatableSelect
                  name="to"
                  onInputChange={onInputChangeContacts}
                  isLoading={isContactsLoading}
                  placeholder="Please select or enter recipient"
                  onChange={onChangeDropdownInput}
                  value={{
                    value: '',
                    label: watch('to')
                  }}
                  formatCreateLabel={(inputValue) => `External Contact: "${inputValue}"`}
                  noOptionsMessage={() => 'No contacts found'}
                  options={parseContacts()}
                />
                {errors?.to && <p className="text-xs text-red-400 pl-1 pt-1">{errors?.to?.message}</p>}
              </div>
            </section>
            <section id="3rd-column" className="basis-1/3">
              <div>
                <Typography classNames="mb-2" styleVariant="semibold">
                  Issued Date
                </Typography>
                <div className="relative z-50">
                  <DateTimePicker
                    ignoreDefault
                    disabledDatesBefore={new Date().toString()}
                    height="48"
                    id="issue-date"
                    inputDate={getValues('issuedDate') ? new Date(watch('issuedDate')) : null}
                    onSelect={handleOnChangeDate}
                    placeholder="Select an issued date"
                    showTimeSelect={false}
                  />
                </div>

                {errors?.issuedDate && (
                  <div style={{ height: 14 }}>
                    <p className="text-xs text-red-400 pl-1 pt-1">{errors?.issuedDate?.message}</p>
                  </div>
                )}
              </div>
              <div className=" mt-5">
                <div className="flex flex-row gap-2 items-center mb-2">
                  <Typography styleVariant="semibold">Due Date</Typography>

                  <Image
                    data-tip="due-date-tooltip"
                    data-for="due-date-tooltip"
                    src={InfoIcon}
                    className="cursor-pointer"
                    alt="info-icon"
                    height={20}
                  />
                  <ReactTooltip
                    id="due-date-tooltip"
                    borderColor="#eaeaec"
                    border
                    backgroundColor="white"
                    textColor="#111111"
                    effect="solid"
                    place="top"
                    className="w-[280px] !px-[10px]"
                  >
                    <Typography variant="caption">Invoice link will automatically expire on this date.</Typography>
                  </ReactTooltip>
                </div>
                <div className="relative z-[45]">
                  <DateTimePicker
                    placeholder="Select a due date"
                    height="48"
                    disabledDatesBefore={
                      watch('issuedDate') ? addDays(new Date(watch('issuedDate')), 1).toString() : new Date().toString()
                    }
                    inputDate={getValues('dueDate') ? new Date(watch('dueDate')) : null}
                    onSelect={handleOnChangeDueDate}
                    ignoreDefault
                    showTimeSelect={false}
                  />
                </div>
                {errors?.dueDate && <p className="text-xs text-red-400 pl-1 pt-1">{errors?.dueDate?.message}</p>}
              </div>
            </section>
          </div>
        </div>
        <div className="min-w-[1200px]">
          <Divider />
          <div className="flex flex-row justify-end gap-8 items-center">
            <div className="flex flex-row items-center justify-between w-full gap-2 mb-2">
              <div className="flex flex-row items-center gap-2">
                <Typography color="secondary">Default Currency:</Typography>
                <div className="flex flex-row items-center gap-2 bg-[#F8F8F8] p-2 rounded-md">
                  {integrationData?.metadata?.currencyCategory === 'cryptocurrency' ? (
                    <Image alt="crypto-image" width={16} height={16} src={renderCryptoCurrencyImage()} />
                  ) : (
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      style={{
                        fontSize: '20px',
                        lineHeight: '20px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <Typography color="secondary">{integrationData?.metadata?.currency ?? 'USD'}</Typography>
                </div>
                <Image
                  data-tip="default-currency-tooltip"
                  data-for="default-currency-tooltip"
                  src={InfoIcon}
                  className="cursor-pointer"
                  alt="info-icon"
                  height={12}
                />
                <ReactTooltip
                  id="default-currency-tooltip"
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="w-[280px] !px-[10px]"
                >
                  <Typography variant="caption">
                    To edit your default currency, please approach dtcpay to update it.
                  </Typography>
                </ReactTooltip>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <Typography styleVariant="semibold" classNames="mb-3">
                Tax
              </Typography>

              <div className="w-[200px] relative z-40">
                <Dropdown
                  showCaret
                  onChange={handleOnChangeTax}
                  placeholder="Select tax option"
                  options={[
                    { value: 'none', label: 'No Tax' },
                    { value: 'inclusive', label: 'Tax Inclusive' },
                    { value: 'exclusive', label: 'Tax Exclusive' }
                  ]}
                />
                <div style={{ height: 14 }}>
                  {' '}
                  {errors?.tax && (
                    <p className="text-xs flex items-center text-red-400 pl-1 pt-1">{errors?.tax?.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto mt-3">
            <CreateInvoiceTable
              append={append}
              watch={watch}
              control={control}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              countryIso="SG"
              taxType={watch('tax')}
              fiatCurrencySetting={{
                code: integrationData?.metadata?.currency
              }}
              fields={fields}
              handleOnChange={handleOnChange}
              remove={remove}
            />
          </div>
        </div>
      </View.Content>
      <View.Footer>
        <section id="footer-buttons" className="flex flex-row gap-4 bg-white">
          <Button
            variant="grey"
            label="Cancel"
            height={40}
            onClick={() => cancelCreateModalProvider.methods.setIsOpen(true)}
          />
          <Button variant="black" type="submit" label="Create and Share" height={40} />
        </section>
      </View.Footer>
      <CancelCreateModal handleOnConfirm={handleDiscardForm} provider={cancelCreateModalProvider} />

      <InvoiceDetailModal
        countryIso="SG"
        taxType={watch('tax')}
        fiatCurrencySetting={{
          currencyCode: integrationData?.metadata?.currency ?? 'USD',
          currencyCategory: integrationData?.metadata?.currencyCategory ?? 'fiat',
          currencyImage: renderCryptoCurrencyImage() ?? ''
        }}
        data={parsePreviewData(getValues())}
        provider={previewModalProvider}
      />
    </form>
  )
}
export default CreateInvoiceView
