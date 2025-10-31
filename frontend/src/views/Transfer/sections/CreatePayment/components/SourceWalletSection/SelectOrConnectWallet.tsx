import { FC } from 'react'

import { customStyles } from '@/constants/styles'

import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'

import { FormErrorMessage } from '@/views/Transfer/components'
import Typography from '@/components-v2/atoms/Typography'
import { Alert } from '@/components-v2/molecules/Alert'
import FormatOptionLabel from '@/components/SelectItem/FormatOptionLabel'

import CustomMenuList from '@/components/SelectItem/MenuList'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import ConnectWalletButton from '@/components-v2/molecules/ConnectWalletButton'

import WarningIcon from '@/public/svg/icons/cyan-info-icon.svg'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'

interface ISectionSourceWalletProps {
  account: string
  formState: any
  options: any
  handleEmptySource: any
  handleOnChange: any
  selectedSourceWallet: any
  selectedChain: any
}

const SelectOrConnectWallet: FC<ISectionSourceWalletProps> = ({
  account,
  formState,
  options,
  selectedChain,
  handleEmptySource,
  handleOnChange,
  selectedSourceWallet
}) => {
  const router = useRouter()
  const isError = formState?.errors?.sourceWalletId?.message
  const isMultiCurrencyError = formState?.errors?.sourceWalletId?.type === 'check-multicurrency-for-eoa'
  const errorBorder = isError && !isMultiCurrencyError ? 'border-[#C61616]' : ''

  const customOptionLabel = (props) => <FormatOptionLabel selectedChain={selectedChain} {...props} />

  return (
    <div className="py-4 w-full">
      {account ? (
        <>
          <div className={`rounded ${errorBorder}`}>
            <SelectItem
              name="source-wallet"
              options={options}
              placeholder="Select a wallet"
              customStyles={customStyles}
              formatOptionLabel={customOptionLabel}
              components={{
                MenuList: (prop) => CustomMenuList(prop, true)
              }}
              noOptionsMessage={handleEmptySource}
              onChange={handleOnChange}
              value={selectedSourceWallet}
            />
          </div>
          {isError &&
            (isMultiCurrencyError ? (
              <Alert isVisible removeBg variant="warning">
                <Alert.Icon />
                <Alert.Text>{formState.errors.sourceWalletId?.message}</Alert.Text>
              </Alert>
            ) : (
              <FormErrorMessage
                img={ErrorCircleIcon}
                errorMessage={formState.errors.sourceWalletId?.message as string}
              />
            ))}
          {router.pathname.includes('/fiat') && (
            <div className="mt-2 flex items-center gap-2">
              <Image src={WarningIcon} width={14} height={14} />
              <Typography variant="caption" classNames="text-[#00A3FF]">
                USDC will be deducted from your wallet to complete this payment.
              </Typography>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={`border rounded-lg p-4 ${isError ? 'border-[#C61616]' : 'border-[#F1F1EF]'}`}>
            <Typography variant="body2" color="primary" classNames="mb-4">
              To proceed with your selection, please connect your wallet first.
            </Typography>
            <ConnectWalletButton />
          </div>
          {isError && <FormErrorMessage errorMessage={formState.errors.sourceWalletId?.message as string} />}
        </>
      )}
    </div>
  )
}

export default SelectOrConnectWallet
