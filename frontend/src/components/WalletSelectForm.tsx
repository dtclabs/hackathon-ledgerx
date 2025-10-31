/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, useEffect } from 'react'
import Image from 'next/legacy/image'
import MetamaskIcon from '@/public/svg/wallet-icons/metamask-icon.svg'
import WalletConnectIcon from '@/public/svg/wallet-icons/wallet-connect-icon.svg'
import ArrowLeft from '@/public/svg/icons/arrow-left.svg'
import { Card, TypographyV2 as Typography, Button } from '@/components-v2'
import { Alert } from './Alert'
import { useWeb3React } from '@web3-react/core'

interface IProps {
  onClickBack: any
  handleOnClickSignUp: any
  onClickMetamaskSign: any
  onClickWalletConnectSign: any
  message?: string
}

const WalletSelectForm: FC<IProps> = ({ onClickMetamaskSign, onClickWalletConnectSign, onClickBack, message }) => {
  const { account, deactivate } = useWeb3React()

  useEffect(() => {
    if (account) deactivate()
  }, [])

  return (
    <div className="flex flex-col items-center">
      <Card shadow="sm" className="w-[500px] h-[550px] p-16 rounded-r-2xl flex flex-col justify-center">
        <div className="flex justify-center flex-col">
          <div className="flex justify-center">
            <Typography className=" p-2" variant="subtitle2" onClick={onClickBack}>
              <Image src={ArrowLeft} alt="arrow-left" />{' '}
              <span className="pl-2 hover:underline cursor-pointer">Back</span>
            </Typography>
          </div>
        </div>
        <Typography style={{ fontWeight: 600 }} className="font-[inter] text-center text-2xl mt-8" variant="title1">
          Connect your wallet
        </Typography>
        <Typography
          color="secondary"
          className="font-[inter] text-center mb-8  mt-3 "
          variant="title1"
          style={{ fontSize: 14, color: '#667085' }}
        >
          Choose a provider to connect an existing wallet or create a new one.
        </Typography>
        <Button leftIcon={MetamaskIcon} size="xxl" color="tertiary" className="mb-4" onClick={onClickMetamaskSign}>
          Metamask
        </Button>
        <Button leftIcon={WalletConnectIcon} size="xxl" color="tertiary" onClick={onClickWalletConnectSign}>
          Wallet Connect
        </Button>
        {message && (
          <Alert variant="danger" className="mt-5 text-base leading-6 font-medium py-3">
            {message}
          </Alert>
        )}
      </Card>
    </div>
  )
}
export default WalletSelectForm
