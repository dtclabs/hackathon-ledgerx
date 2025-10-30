import { CurrencyType, IPayment } from '@/api-v2/payment-api'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import TabItem from '@/components/TabsComponent/TabItem'
import { selectTokenPriceIdMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { useAppSelector } from '@/state'
import React, { useEffect, useState } from 'react'
import ActivityTab from './ActivityTab'
import OverviewTab from './OverviewTab'

export interface IPaymentDetailForm {
  account: { value: string; label: string }
  notes: string
  files: any[]
  annotations?: { value: string; label: string }[]
}

const detailTabs = [
  {
    key: 'overview',
    name: 'Overview',
    active: true
  },
  {
    key: 'activity',
    name: 'Activity Log',
    active: false
  }
]

interface PaymentDetail {
  selectedData: IPayment
  settings: any
  verifiedCryptoCurrencyMap: { [id: string]: any }
}

const PaymentDetail: React.FC<PaymentDetail> = ({ selectedData, settings, verifiedCryptoCurrencyMap }) => {
  const cryptocurrencyPriceMap = useAppSelector(selectTokenPriceIdMap)
  const [activeTab, setActiveTab] = useState<string>('overview')

  const [triggerGetPrice] = useLazyGetTokenPriceQuery()

  useEffect(() => {
    const getPrice = async () => {
      const token =
        selectedData?.destinationCurrencyType === CurrencyType.FIAT
          ? selectedData?.sourceCryptocurrency?.symbol?.toLowerCase()
          : selectedData?.destinationCurrency?.symbol?.toLowerCase()
      if (token && !cryptocurrencyPriceMap[verifiedCryptoCurrencyMap[token]?.publicId]) {
        await triggerGetPrice({
          params: {
            cryptocurrencyId: verifiedCryptoCurrencyMap[token]?.publicId,
            fiatCurrency: settings?.fiatCurrency?.code,
            date: new Date().toISOString()
          }
        }).unwrap()
      }
    }
    getPrice()
  }, [selectedData?.sourceCryptocurrency?.symbol, selectedData?.destinationCurrency?.symbol])

  return (
    <div className="-mt-8">
      <UnderlineTabs
        tabs={detailTabs}
        active={activeTab}
        setActive={setActiveTab}
        classNameBtn="font-semibold text-sm px-6 py-[10px]"
        wrapperClassName="border-b-[1px] border-grey-200"
      >
        <TabItem key="overview">
          <OverviewTab
            data={selectedData}
            settings={settings}
            cryptocurrencyPrice={
              selectedData?.destinationCurrencyType === CurrencyType.FIAT
                ? cryptocurrencyPriceMap[selectedData?.sourceCryptocurrency?.symbol?.toLowerCase()] || '0'
                : cryptocurrencyPriceMap[selectedData?.destinationCurrency?.symbol?.toLowerCase()] || '0'
            }
          />
        </TabItem>
        <TabItem key="activity">
          <ActivityTab data={selectedData} />
        </TabItem>
      </UnderlineTabs>
    </div>
  )
}

export default PaymentDetail
