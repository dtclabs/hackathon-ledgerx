import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Badge from '@/components-v2/molecules/Badge/Badge2'
import WalletIcon from '@/public/svg/icons/wallet-icon.svg'
import { CardOnboardingStatus } from '@/slice/cards/cards-type'
import Image from 'next/image'
import React, { useMemo } from 'react'

const WhitelistWallet: React.FC<{ status: CardOnboardingStatus; address: string }> = ({ status, address }) => {
  const onStart = () => {
    console.log('start')
  }
  const onChangeAddress = () => {
    console.log('change')
  }

  const handler = useMemo(() => {
    switch (status) {
      case CardOnboardingStatus.COMPLETED:
        return {
          status: 'Completed',
          color: 'success'
        }
      case CardOnboardingStatus.PENDING:
        return {
          status: 'Pending',
          color: 'orange',
          ctaLabel: 'Pending'
        }
      default:
        return {
          status: 'Not Started',
          ctaLabel: 'Whitelist Wallet',
          ctaAction: onStart
        }
    }
  }, [status])

  return (
    <div className="bg-white rounded-lg w-[420px] h-[240px] px-8 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between bg-[#FDF77D] p-[10px] rounded-full">
            <Image src={WalletIcon} alt="icon" width={20} height={20} />
          </div>
          <Typography variant="heading3">Whitelist Wallet</Typography>
        </div>

        <Badge variant="rounded" color={handler?.color as any}>
          <Badge.Label>{handler.status}</Badge.Label>
        </Badge>
      </div>
      <Typography variant="body2" color="secondary" classNames="flex-1">
        Whitelist your organization&apos;s wallet. This trusted wallet will be used to fund the deposit wallet for all
        the cards.
      </Typography>

      <div className="border-b w-full" />

      {status === CardOnboardingStatus.COMPLETED && address ? (
        <div className="flex items-center justify-between">
          <Typography variant="body2" color="secondary">
            Whitelisted wallet:
            <span className="font-bold">{address}</span>
          </Typography>
          <Button height={40} label="Change" onClick={onChangeAddress} variant="ghost" classNames="w-fit" />
        </div>
      ) : (
        <Button
          height={40}
          label={handler.ctaLabel}
          onClick={handler?.ctaAction}
          disabled={!handler?.ctaAction}
          variant="black"
          classNames="w-fit"
        />
      )}
    </div>
  )
}

export default WhitelistWallet
