import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { useAppSelector } from '@/state'

const DisplaySafe = (params) => {
  const { data, supportedChains } = params

  const chainIcons = useAppSelector(selectChainIcons)

  return (
    <div className="h-full flex items-center">
      <div>
        <Typography classNames="mb-1" variant="body2">
          <span className="align-middle mr-1">
            {chainIcons[data.blockchainId] && (
              <Image src={chainIcons[data.blockchainId]} width={14} height={14} className="rounded" />
            )}
          </span>
          {data?.wallet?.name}
        </Typography>
        <WalletAddressCopy address={data?.wallet?.address}>
          {/* <WalletAddressCopy.Link
            address={data?.wallet?.address}
            linkType="address"
            isMultiple={false}
            blockExplorer={supportedChains?.find((_chain) => _chain.id === data.blockchainId)?.blockExplorer}
          /> */}
          <WalletAddressCopy.Copy address={data?.wallet?.address} />
        </WalletAddressCopy>
      </div>
    </div>
  )
}
export default DisplaySafe
