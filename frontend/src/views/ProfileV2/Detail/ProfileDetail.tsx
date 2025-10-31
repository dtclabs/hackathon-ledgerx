/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import type { NextPage } from 'next'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useGetMemberQuery } from '@/api-v2/members-api'
// import { Typography } from '@/components-v2/Typography'
import AddressLabelComplex from './components/AddressLabelComplex'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useSelector } from 'react-redux'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import Typography from '@/components-v2/atoms/Typography'
import { accountSelectorV2 } from '@/slice/account/account-slice'

const CONTACT_MAP = {
  1: 'E-Mail',
  2: 'Twitter',
  3: 'Discord',
  4: 'Telegram'
}

const MemberDetailPage: NextPage = () => {
  const router = useRouter()
  const { organizationId = '', id = '' } = router.query
  const supportedChains = useSelector(supportedChainsSelector)
  const account = useSelector(accountSelectorV2)

  const { data: orgProfile } = useGetMemberQuery(
    { orgId: String(organizationId), memberId: String(id) },
    { skip: !organizationId || !id }
  )

  const addressLabel = (blockchain) => {
    if (blockchain.id === 'ethereum') return 'Ethereum  Wallet'
    return `${blockchain.name} Wallet`
  }

  return (
    <>
      <Header>
        <Header.Left>
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.back()}
            />

            <div className="pl-5">
              <Header.Left.Title>
                {orgProfile?.data?.firstName
                  ? `${orgProfile?.data?.firstName} ${orgProfile?.data?.lastName}`
                  : orgProfile?.data?.role}
              </Header.Left.Title>
            </div>
          </div>
        </Header.Left>
      </Header>
      <View.Content>
        <Typography color="primary" variant="body1" styleVariant="semibold" classNames="px-2 py-4">
          Basic Information
        </Typography>
        <div className="flex flex-row px-2 pt-4 pb-4 gap-4">
          <Typography color="secondary" classNames="basis-2/12" variant="body1" styleVariant="medium">
            Full Name
          </Typography>
          <Typography color="primary" variant="body1" styleVariant="medium">
            {orgProfile?.data?.firstName ? `${orgProfile?.data?.firstName} ${orgProfile?.data?.lastName}` : '-'}
          </Typography>
        </div>

        <div className="flex flex-row px-2 pt-4 pb-4 gap-4">
          <Typography color="secondary" classNames="basis-2/12" variant="body1" styleVariant="medium">
            Log in Email/Wallet
          </Typography>
          <Typography color="primary" variant="body1" styleVariant="medium">
            {account?.name}
          </Typography>
        </div>

        <div className="flex flex-row px-2 pt-4 pb-4 gap-4">
          <Typography color="secondary" classNames="basis-2/12" variant="body1" styleVariant="medium">
            Role
          </Typography>
          <Typography color="primary" variant="body1" styleVariant="medium">
            {orgProfile?.data?.role}
          </Typography>
        </div>

        {orgProfile?.data?.addresses?.length === 0 ? null : (
          <>
            <hr />
            <Typography color="primary" variant="body1" styleVariant="semibold" classNames="px-2 py-4">
              Wallets
            </Typography>
            <div className="px-2 pt-4 pb-4">
              {orgProfile?.data?.addresses?.map((item) => (
                <div className="flex flex-row gap-4 content-center mb-8">
                  <Typography color="secondary" classNames="basis-2/12" variant="body1" styleVariant="medium">
                    {addressLabel(supportedChains?.find((chain) => chain.id === item.blockchainId))}
                  </Typography>
                  <AddressLabelComplex
                    address={item.address}
                    chain={supportedChains?.find((chain) => chain.id === item.blockchainId)}
                    symbol="ETH"
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {orgProfile?.data?.contacts.length === 0 ? null : (
          <>
            <hr />
            <Typography color="primary" variant="body1" styleVariant="semibold" classNames="px-2 py-4">
              Contact Details
            </Typography>
            <div className="px-2 pt-4 pb-6">
              {orgProfile?.data?.contacts?.map((item) => (
                <div className="flex flex-row gap-4 mb-8">
                  <Typography color="secondary" classNames="basis-2/12" variant="body1" styleVariant="medium">
                    {CONTACT_MAP[item.providerId]}
                  </Typography>
                  <Typography color="primary" variant="body1" styleVariant="medium">
                    {item.content}
                  </Typography>
                </div>
              ))}
            </div>
          </>
        )}
      </View.Content>
    </>
  )
}

export default MemberDetailPage
