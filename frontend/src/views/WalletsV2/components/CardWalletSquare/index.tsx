import React from 'react'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import Link from 'next/link'
import { IChainData } from '@/components-v2/molecules/ChainSelectorDropdownV2'
import { Divider } from '@/components-v2/Divider'
import ReactTooltip from 'react-tooltip'
import { useOrganizationId } from '@/utils/getOrganizationId'

export interface IWalletDetails {
  link: string
  image: string
  name: string
  title: string
  description: string
  chains?: IChainData[]
}

interface ICardWalletSquareProps {
  walletDetails: IWalletDetails
}

const CardWalletSquare: React.FC<ICardWalletSquareProps> = ({ walletDetails }) => {
  const orgId = useOrganizationId()
  const { link, image, name, title, description, chains } = walletDetails || {}

  return (
    <Link href={`/${orgId}/wallets/import/${link}`} legacyBehavior>
      <div className="mr-4 cursor-pointer rounded-xl border border-dashboard-border-200 hover:bg-grey-200 sm:mr-0">
        <div className="p-6 w-[376px] h-[170px] sm:w-full sm:h-full">
          <div className=" -mb-5 flex items-center gap-2">
            <Image src={image} height={45} width={45} />
            <div className="flex flex-col items-start">
              <Typography variant="subtitle1">{name}</Typography>
              <div className="mb-2">
                <Typography color="secondary" styleVariant="regular" variant="caption">
                  {title}
                </Typography>
              </div>
            </div>
          </div>
          <Divider />
          <Typography classNames="mb-3  text-left" color="secondary" styleVariant="regular" variant="body2">
            {description}
          </Typography>
          {chains && (
            <div className="flex">
              {chains?.map((chain) => {
                const chainId = (chain as any)?.id ?? (chain as any)?.value
                const chainName = (chain as any)?.name ?? (chain as any)?.label
                return (
                  <div className="pr-1" key={chainId} data-tip data-for={String(chainId)}>
                    <Image src={(chain as any)?.imageUrl} width={18} height={18} className="rounded" />
                    <ReactTooltip
                      id={String(chainId)}
                      effect="solid"
                      place="top"
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                    >
                      {chainName}
                    </ReactTooltip>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CardWalletSquare
