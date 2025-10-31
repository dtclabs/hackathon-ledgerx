/* eslint-disable no-promise-executor-return */
import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import ConnectWalletButton from '@/components-v2/molecules/ConnectWalletButton'
import DisconnectWalletChip from '@/components-v2/molecules/DisconnectWalletChip'
import ChainSelectorDropdownV2 from '@/components-v2/molecules/ChainSelectorDropdownV2'

interface IConnectWalletChain {
  account: string
  chains: any
  isLoading: boolean
}

const ConnectWalletChain: FC<IConnectWalletChain> = ({ account, chains, isLoading }) => {
  const isConnectWalletDisabled = Boolean(account)
  const isChainSelectDisabled = !account
  return (
    <div>
      {!account && (
        <div className="flex flex-row items-center gap-4 ">
          <Typography variant="body2" color="primary">
            Please connect your wallet to approve transactions
          </Typography>
          <ConnectWalletButton isDisabled={isConnectWalletDisabled || isLoading} />
        </div>
      )}
      {account && (
        <div className="flex gap-3 items-center">
          <ChainSelectorDropdownV2 supportedChainsFormatted={chains} isDisabled={isChainSelectDisabled || isLoading} />
          <DisconnectWalletChip isDisabled={isLoading} />
        </div>
      )}
    </div>
  )
}

export default ConnectWalletChain
