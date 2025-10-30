import Link from 'next/link'
import { FC } from 'react'
import SolanaLogo from '@/public/svg/sample-token/Solana.svg'
import SafeLogo from '@/public/svg/logos/import-safe.svg'
import WalletIconSquare from '../components/WalletIconSquare'
import Typography from '@/components-v2/atoms/Typography'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Button from '@/components-v2/atoms/Button'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useRouter } from 'next/router'
import CardWalletSquare, { IWalletDetails } from '../components/CardWalletSquare'
import { useAppSelector } from '@/state'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import useIsMobile from '@/hooks/useIsMobile'

const ImportWallet: FC = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()

  const breadcrumbItems = [
    { to: `/${organizationId}/wallets`, label: 'Wallets' },
    { to: `/${organizationId}/wallets/import`, label: 'Import Wallet' }
  ]

  return (
    <div className="bg-white p-4 rounded-lg ">
      <Header>
        <div className="flex items-center sm:w-full sm:flex-start">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.back()}
          />
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>
        <SelectWalletType />
      </View.Content>
    </div>
  )
}
export default ImportWallet

export const SelectWalletType = () => {
  const supportedChainsOrg = useAppSelector(supportedChainsSelector)
  const isMobile = useIsMobile()
  const walletImportList: IWalletDetails[] = [
    {
      link: 'eoa',
      image: SolanaLogo,
      name: 'Solana Compatible (SVM)',
      title: 'Chain',
      description: 'Import wallet compatible with Solana accounts and programs',
      chains: supportedChainsOrg.map((chain) => ({
        value: chain.id,
        label: chain.name,
        imageUrl: chain.imageUrl
      }))
    },
    {
      link: 'safe',
      image: SafeLogo,
      name: 'Safe',
      title: 'Safe Wallet',
      description: 'Import Safe wallet.'
    }
  ]

  const mobileWalletImportList = walletImportList.slice(0, 1)

  return (
    <div className="flex justify-center sm:w-full">
      <div className="mt-[120px] flex-col justify-center content-center text-center sm:mt-8">
        <Typography variant="subtitle2" classNames="mb-6 sm:hidden">
          Select one of the following to import a wallet/safe
        </Typography>
        <div className="flex sm:flex-col sm:w-full sm:gap-4">
          {isMobile
            ? mobileWalletImportList.map((wallet) => <CardWalletSquare walletDetails={wallet} />)
            : walletImportList.map((wallet) => <CardWalletSquare walletDetails={wallet} />)}
        </div>
      </div>
    </div>
  )
}
