/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import { Button } from '@/components-v2'
// import useAuth from '@/hooks/useAuth'
import SourceDropdown from '../SourceDropdown/SourceDropdown'
import { ConnectorNames } from '@/utils/web3React'
import Image from 'next/legacy/image'
import warning from '@/assets/svg/warning.svg'
import { ITransactionForm } from '../../interface'
import useActivateWeb3Provider from '@/hooks-v2/useActivateWeb3Provider'

interface ISourceDetail {
  account: any
  address: string
  availableSourceList: string[]
  onShowImportModal: () => void
  setConnectError: React.Dispatch<React.SetStateAction<boolean>>
  refreshLoading: boolean
  sourceAddress: string
  sourceList: string[]
  setSourceAddress: React.Dispatch<React.SetStateAction<string>>
  setStep: React.Dispatch<React.SetStateAction<number>>
  onGenericFormSubmit?: () => void
  isGenericLink?: boolean
}

const SourceDetail: React.FC<ISourceDetail> = ({
  account,
  address,
  onShowImportModal,
  availableSourceList,
  setConnectError,
  refreshLoading,
  setSourceAddress,
  sourceAddress,
  sourceList,
  setStep,
  onGenericFormSubmit,
  isGenericLink
}) => {
  // const { login } = useAuth()
  const [error, setError] = useState<string>()
  const { connectMetamaskWallet } = useActivateWeb3Provider()

  const handleContinue = () => {
    if (sourceAddress === address) {
      setError('This address is your connected wallet')
    } else {
      if (isGenericLink) {
        onGenericFormSubmit()
      } else {
        setStep(3)
        setError('')
      }
    }
  }

  return !account ? (
    <div className="px-16 text-center h-full flex flex-col justify-center">
      <div className="text-xl font-semibold leading-7 text-center mb-8">Please connect your wallet to make payment</div>
      <Button
        size="lg"
        color="white"
        variant="contained"
        onClick={() => {
          if (!window.ethereum) {
            setConnectError(true)
          } else {
            connectMetamaskWallet()
            // login(ConnectorNames.Injected, true)
          }
        }}
      >
        Connect Wallet
      </Button>
    </div>
  ) : (
    <div className="p-8 h-full flex flex-col justify-between">
      <div>
        <div className="text-base font-semibold mb-4">Paying From</div>
        <SourceDropdown
          refreshLoading={refreshLoading}
          source={sourceAddress}
          sourceList={sourceList}
          setSource={setSourceAddress}
        />
        {/* {availableSourceList &&
          (availableSourceList.length ? (
            <div className="flex items-center text-sm pt-3">
              <div className="text-grey-50">We've detected safes connected to your wallet</div>
              <button
                className="text-dashboard-darkMain underline pl-2"
                type="button"
                onClick={() => onShowImportModal()}
              >
                Pay with Safe
              </button>
            </div>
          ) : (
            <div className="flex items-center text-sm pt-3">
              <div className="text-grey-50">No Safes detected, please create one on</div>
              <a
                target="_blank"
                className="text-dashboard-darkMain underline pl-2"
                href="https://gnosis-safe.io/"
                rel="noreferrer"
              >
                Gnosis Safe
              </a>
            </div>
          ))} */}
        {error && (
          <div className="text-sm font-inter flex items-center text-[#E83F6D]">
            <div className="mr-2 flex items-center">
              <Image src={warning} alt="warning" width={16} height={16} />
            </div>
            {error}
          </div>
        )}
      </div>
      <Button size="lg" fullWidth onClick={handleContinue} className="justify-end">
        Continue
      </Button>
    </div>
  )
}

export default SourceDetail
