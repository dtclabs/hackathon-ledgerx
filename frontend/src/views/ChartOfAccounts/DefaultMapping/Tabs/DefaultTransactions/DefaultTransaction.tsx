import { FC } from 'react'
import FeesSection from '../../components/FeesSection'
import { MAPPING_CONTENT } from '../../page-copy'
import _ from 'lodash'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'

interface IProps {
  chartOfAccountsMapping: any
  parsedChartOfAccounts: any
  handleChangeAccount: any
}

const DefaultTransactionsTabs: FC<IProps> = ({
  chartOfAccountsMapping,
  parsedChartOfAccounts,
  handleChangeAccount
}) => {
  const showBanner = useAppSelector(showBannerSelector)
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)

  const filteredAccounts =
    chartOfAccountsMapping?.filter((item) => item.type !== 'wallet' && item.type !== 'recipient') || []

  return (
    <div>
      <div
        className={`pl-14 pr-14 pt-6 overflow-y-auto ${showBanner ? 'h-[calc(100vh-304px)]' : 'h-[calc(100vh-236px)]'}`}
      >
        <div className="flex flex-col gap-8">
          {filteredAccounts
            ?.sort((a: any, b: any) => (a.type < b.type ? -1 : 1))
            ?.map((item: any) => (
              <FeesSection
                key={item.id}
                title={MAPPING_CONTENT[item?.type]?.title}
                subtitle={MAPPING_CONTENT[item?.type]?.subtitle}
                options={parsedChartOfAccounts}
                onChangeAccount={handleChangeAccount}
                account={item?.chartOfAccount?.id}
                selectedAccountOption={chartOfAccounts?.find((account) => account.value === item?.chartOfAccount?.id)}
                mapping={{
                  id: item.id,
                  type: item.type
                }}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default DefaultTransactionsTabs
