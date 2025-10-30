import Link from 'next/link'
import { FC } from 'react'
import EthereumLogo from '@/public/svg/logos/import-ethereum.svg'
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

const ImportWallet: FC = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()

  const breadcrumbItems = [
    { to: `/${organizationId}/wallets`, label: 'Wallets' },
    { to: `/${organizationId}/wallets/import`, label: 'Import Wallet' }
  ]

  return (
    <>
      <Header>
        <div className="flex items-center">
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
        <div className="flex justify-center">
          <div className="mt-[120px] flex-col justify-center content-center text-center">
            <Typography variant="subtitle2" classNames="mb-6">
              Select one of the following to import a wallet/safe
            </Typography>
            <div className="flex">
              <Link href={`${window.location.href}/eoa`} className="mr-4">
                <WalletIconSquare walletImage={EthereumLogo} walletName="Ethereum (Wallet)" />
              </Link>
              <Link href={`${window.location.href}/safe`}>
                <WalletIconSquare walletImage={SafeLogo} walletName="Safe" />
              </Link>
            </div>
          </div>
        </div>
      </View.Content>
    </>
  )
}
export default ImportWallet
