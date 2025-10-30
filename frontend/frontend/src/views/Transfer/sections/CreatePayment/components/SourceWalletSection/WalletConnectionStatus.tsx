import { FC, useEffect, useState } from 'react'

import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import DisconnectWalletChip from '@/components-v2/molecules/DisconnectWalletChip'
import ChainSelectorDropdown from '@/components-v2/molecules/ChainSelectorDropdownV2'

// import useStorage from '@/hooks-v2/utility/useStorage'

interface IWalletConnectionStatusProps {
  account: any
  parsedChainData: any
}

const WalletConnectionStatus: FC<IWalletConnectionStatusProps> = ({ account, parsedChainData }) => (
  <div className="flex justify-between items-center mt-1">
    <Typography variant="subtitle1">Select the wallet you want to pay from</Typography>
    {account ? (
      <div className="flex gap-3 items-center">
        <ChainSelectorDropdown supportedChainsFormatted={parsedChainData} />
        <DisconnectWalletChip />
      </div>
    ) : null}
  </div>
)
export default WalletConnectionStatus
