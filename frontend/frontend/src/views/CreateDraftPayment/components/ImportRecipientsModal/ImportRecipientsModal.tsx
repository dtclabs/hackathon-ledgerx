/* eslint-disable react/no-unescaped-entities */
import { FC, useState } from 'react'
import { ethers } from 'ethers'
import { useAppSelector } from '@/state'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { selectChartOfAccountMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import * as yup from 'yup'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'
import UploadComponent from './UploadComponent'
import DataView from './DataView'
import { isEmpty } from 'lodash'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import Button from '@/components-v2/atoms/Button'
import ReactTooltip from 'react-tooltip'
import ErrorBanner from '../../../MakePayment2/components/ErrorBanner'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { CurrencyType } from '@/api-v2/payment-api'

const EXPECTED_CSV_HEADERS = [
  { name: 'Recipient Wallet Address', required: true },
  { name: 'Recipient Name', required: false },
  { name: 'Token', required: true },
  { name: 'Amount', required: false },
  { name: 'Account', required: false },
  { name: 'Notes', required: false }
]

const CSV_HEADER_MAP = {
  'Recipient Wallet Address': 'walletAddress',
  'Recipient Name': 'name',
  Token: 'token',
  Amount: 'amount',
  Account: 'account',
  Notes: 'note'
}
interface IProps {
  provider: any
  currencyType?: CurrencyType
}

const ImportRecipientsModal: FC<IProps> = ({ provider, currencyType = CurrencyType.CRYPTO }) => {
  const { control, getValues, setValue, trigger } = useFormContext()
  const organizationId = useOrganizationId()
  const [csvformatError, setCsvFormatError] = useState('')
  const selectedChain = useAppSelector(selectedChainSelector)
  const { append: recipientAppend } = useFieldArray<any>({ control, name: 'recipients', keyName: 'id' })
  const verifiedCryptoCurrencyMap = useAppSelector(selectVerifiedCryptocurrencyMap)
  const chainIcons = useAppSelector(selectChainIcons)
  const chartOfAccountMap = useAppSelector(selectChartOfAccountMap)
  const [validationErrors, setValidationErrors] = useState({})
  const [data, setData] = useState<any[]>([])
  const { data: recipientList } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const { data: sourceList } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: {
        size: 999
      }
    },
    { refetchOnMountOrArgChange: true }
  )

  const schema = yup.object().shape({
    walletAddress: yup
      .string()
      .required('Address is required')
      .test('wallet-address-check', 'Wallet is not a valid address', (value) => {
        const isValidAddress = ethers.utils.isAddress(value)

        return isValidAddress
      }),
    // name: yup.string().required('Name is required'),
    token: yup.string().test('token-valid-check', 'Token is not supported', (value) => {
      if (verifiedCryptoCurrencyMap[value?.toLowerCase()]) {
        return true
      }
      return false
    }),
    amount: yup
      .string()
      .nullable()
      .test('greaterThan0', 'Amount must be greater than 0', (value) => {
        if (!value) return true
        return parseFloat(value) > 0
      })
      .test('isNumber', 'Amount is not a number', (value) => {
        if (!value) return true
        return !Number.isNaN(+value)
      }),
    account: yup
      .string()
      .nullable()
      .test('account-valid-check', 'This account is not supported', (value) => {
        if (!value) return true
        if (chartOfAccountMap[value?.replace(/\s/g, '').toLowerCase()]) {
          return true
        }
        return false
      }),
    note: yup.string().nullable()
  })

  const handleOnClickCancel = () => {
    setData([])
    setValidationErrors({})
  }

  const handleOnFileLoad = async (_data: any) => {
    try {
      const validData: any[] = []
      const validationErrorMap = {}

      // Assuming first row of CSV are the headers
      const headers = _data.data[0]
      const validateHeaderNames = EXPECTED_CSV_HEADERS.filter(
        (header) => !headers.includes(header.name) && header.required
      )
      if (validateHeaderNames.length > 0) {
        throw new Error(`The following headers are missing: ${validateHeaderNames.map((header) => header.name)}`)
      }
      // Map ugly CSV header to less ugly one
      const transformHeaders = []
      headers.forEach((originalHeader) => {
        if (CSV_HEADER_MAP[originalHeader]) {
          transformHeaders.push(CSV_HEADER_MAP[originalHeader])
        }
      })

      // Check all headers are parsed as expected
      if (transformHeaders.length !== headers.length) {
        throw new Error('There is an issue parsing the header names')
      }

      // Remove empty arrays
      const filteredData = _data?.data?.filter((subArray) => {
        const isArrayWithSingleEmptyString = subArray.length === 1 && subArray[0] === ''
        return !isArrayWithSingleEmptyString
      })

      // Map over CSV line items and put into format for Yup to understand
      const transformedData = filteredData.slice(1).map((row, _index) => {
        const rowData = {}
        row.forEach((value, index) => {
          const currentKeyValue = transformHeaders[index]
          rowData[currentKeyValue] = value.replaceAll('"', '')
        })
        return rowData
      })

      transformedData.forEach((rowData, index) => {
        try {
          schema.validateSync(rowData, { abortEarly: false })

          // Inject supporting data into the table row data
          if (verifiedCryptoCurrencyMap[rowData.token.toLowerCase()]) {
            rowData.tokenImage = verifiedCryptoCurrencyMap[rowData.token.toLowerCase()]?.image.small
          }
          if (chartOfAccountMap[rowData?.account?.replace(/\s/g, '').toLowerCase()]) {
            rowData.chartOfAccountData = chartOfAccountMap[rowData.account.replace(/\s/g, '').toLowerCase()]
          }
          rowData.isValid = true
          validData.push(rowData)
        } catch (err) {
          if (err instanceof yup.ValidationError) {
            const rowErrors = err.inner.reduce((acc, error) => {
              acc[error.path] = error.message
              return acc
            }, {})

            validationErrorMap[index] = rowErrors
            validData.push(rowData)
          }
        }
      })

      setData(validData)
      setValidationErrors(validationErrorMap)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleOnClose = () => {
    setValidationErrors([])
    setData([])
  }

  const handleSubmitRecipients = () => {
    const existingRecipients = getValues('recipients')
    existingRecipients.forEach((recipient, index) => {
      if (!recipient.walletAddress) {
        setValue(
          'recipients',
          existingRecipients.filter((recipientObj, indexForRecipient) => indexForRecipient !== index)
        )
      }
    })

    data?.forEach((recipient) => {
      if (recipient.isValid) {
        const token = verifiedCryptoCurrencyMap[recipient.token.toLowerCase()]
        const tokenAddressObj = token?.addresses?.find((address) => address?.blockchainId === selectedChain?.id)

        // TODO-PENDING - Extract to a selector
        const existedRecipient = recipientList?.items?.find((contact) =>
          contact.recipientAddresses.find(
            (recipientItem) =>
              recipientItem.address &&
              recipient.walletAddress &&
              recipientItem.address.toLowerCase() === recipient.walletAddress.toLowerCase()
          )
        )

        const existedSource = sourceList?.items?.find(
          (wallet) =>
            wallet.address &&
            recipient.walletAddress &&
            wallet.address.toLowerCase() === recipient.walletAddress.toLowerCase()
        )

        const recipientName =
          (existedRecipient?.organizationName || existedRecipient?.contactName || existedSource?.name) ?? null

        const recipientId =
          existedRecipient?.recipientAddresses.find(
            (recipientObj) => recipientObj.address.toLowerCase() === recipient.walletAddress.toLowerCase()
          )?.publicId || existedSource?.id

        const recipientType = existedRecipient ? 'recipient_address' : existedSource ? 'wallet' : null

        let metadata = {}
        if (recipientId && recipientType) {
          metadata = {
            id: recipientId,
            type: recipientType
          }
        }

        // TODO - Move this all to validation step
        recipientAppend({
          walletAddress: {
            address: recipient.walletAddress,
            value: recipient.walletAddress,
            label: recipientName || recipient.name,
            chainId: selectedChain?.id,
            src: chainIcons[selectedChain?.id],
            supportedBlockchains: [selectedChain?.id],
            isUnknown: !recipientName && !recipient?.name,
            metadata
          },
          files: [],
          amount: recipient.amount,
          token: {
            // TODO - Eventually need to handle chain that the token does not support
            address: tokenAddressObj,
            id: token?.image?.publicId,
            label: token?.symbol,
            src: token?.image?.thumb,
            value: token?.publicId
          },
          chartOfAccountData: recipient.chartOfAccountData,
          chartOfAccounts: recipient.chartOfAccountData
            ? {
                value: recipient?.chartOfAccountData?.id,
                label: recipient?.chartOfAccountData?.code
                  ? `${recipient?.chartOfAccountData?.code} - ${recipient?.chartOfAccountData?.name}`
                  : `${recipient?.chartOfAccountData?.name}`,
                code: recipient?.chartOfAccountData?.code,
                name: recipient?.chartOfAccountData?.name,
                type: recipient?.chartOfAccountData?.type
              }
            : null,
          note: recipient.note,
          destinationCurrencyType: currencyType
        })
      }
    })
    trigger()
    provider.methods.setIsOpen(false)
    setValidationErrors({})
    setData([])
  }

  const handleOnFileRejected = (file) => {
    if (file[0]?.errors[0]?.code === 'file-invalid-type') {
      toast.error(
        'Error in file upload. Please download the sample .csv file to make sure you are using the right structure'
      )
    }
  }

  return (
    <BaseModal provider={provider} classNames="h-full w-full flex flex-col rounded-none">
      <BaseModal.Header extendedClass="border-b pb-4 items-center">
        <BaseModal.Header.Title>Add Multiple Payments from CSV</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleOnClose} />
      </BaseModal.Header>
      <BaseModal.Body extendedClass="h-full">
        <div className="w-full h-full">
          {data.length === 0 ? (
            <Typography classNames="mt-4" color="secondary">
              Upload a .CSV file with columns Recipient Address, Token, Amount (Optional), Recipient Name (optional),
              Account (optional) and Notes (optional). Click to{' '}
              <a href="/file/LX-recipients-template.csv" download className="mr-2 text-neutral-900 text-sm underline">
                download sample .CSV file.
              </a>
            </Typography>
          ) : (
            <div>
              <Typography>Here&apos;s the data from the CSV file you imported.</Typography>
              {!isEmpty(validationErrors) && (
                <ErrorBanner classNames="mt-6">
                  <Typography variant="body2" classNames="!text-[#C61616]">
                    There are some errors in the uploaded file. Please correct the errors in the file and upload again.
                  </Typography>
                </ErrorBanner>
              )}
            </div>
          )}
          <div className="mt-4 h-[90%]">
            {data.length === 0 ? (
              <UploadComponent handleOnFileLoad={handleOnFileLoad} handleOnFileRejected={handleOnFileRejected} />
            ) : (
              <DataView validationErrors={validationErrors} data={data} />
            )}
          </div>
        </div>
      </BaseModal.Body>
      {data.length > 0 && (
        <BaseModal.Footer extendedClass="!justify-start">
          <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={handleOnClickCancel} />
          <Button
            height={48}
            variant="black"
            disabled={Object.keys(validationErrors).length > 0}
            label={`Add Payments (${data.length})`}
            onClick={handleSubmitRecipients}
            data-tip="import-csv-recipients"
            data-for="import-csv-recipients"
          />
          {!isEmpty(validationErrors) && (
            <ReactTooltip
              id="import-csv-recipients"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
              place="top"
            >
              There are some errors in the uploaded file. Please correct the errors in the file and upload again.
            </ReactTooltip>
          )}
        </BaseModal.Footer>
      )}
    </BaseModal>
  )
}
export default ImportRecipientsModal
