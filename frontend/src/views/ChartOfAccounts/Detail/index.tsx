import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import Link from 'next/link'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { useState, useMemo, useEffect } from 'react'
import TabItem from '@/components/TabsComponent/TabItem'
import { CoABasicInformation } from './components/BasicInformation'
import { CoAMappedInformation } from './components/MappedInformation'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { useGetChartOfAccountQuery } from '@/api-v2/chart-of-accounts'

const DETAIL_TABS = [
  {
    key: 'details',
    name: 'Details'
  }
]
const ChartOfAccountDetail = (props) => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const { data, isLoading } = useGetChartOfAccountQuery(
    { organizationId, chartOfAccountId: router.query.coaId as string },
    { skip: !router.query.coaId && !organizationId }
  )

  const [activeTab, setActiveTab] = useState(DETAIL_TABS[0].key)

  const breadcrumbItems = [
    { to: `/${organizationId}/chart-of-accounts`, label: data?.code ? `${data?.code} - ${data?.name}` : data?.name }
  ]

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
            <Breadcrumb>
              {isLoading ? (
                <SkeletonLoader variant="rounded" height={24} width={300} />
              ) : (
                breadcrumbItems.map(({ to, label }) => (
                  <Link key={to} href={to} className="font-bold" legacyBehavior>
                    {label}
                  </Link>
                ))
              )}
            </Breadcrumb>
          </div>
        </Header.Left>
      </Header>
      <View.Content>
        <UnderlineTabs
          tabs={DETAIL_TABS}
          active={activeTab}
          setActive={setActiveTab}
          classNameBtn="font-semibold text-sm px-6 py-2"
          wrapperClassName="border-b-[1px] border-grey-200"
        >
          <TabItem key={DETAIL_TABS[0].key}>
            <CoABasicInformation isLoading={isLoading} chartOfAccount={data} />
          </TabItem>
          <TabItem />
        </UnderlineTabs>
      </View.Content>
    </>
  )
}

export default ChartOfAccountDetail
