import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import FormatCoAOptionLabel from '@/views/ChartOfAccounts/DefaultMapping/components/FormatCoAOptionLabel/FormatCoAOptionLabel'

const MappingCard = ({ name, code, id, onClickResolve, resolvedMappings, importedChartOfAccounts, ...rest }) => {
  const organizationId = useOrganizationId()

  const resolvedOption = useMemo(() => {
    if (resolvedMappings[id]) {
      const resolvedCoA = importedChartOfAccounts?.find((account) => account.id === resolvedMappings[id].newCOAId)
      if (resolvedCoA) {
        return { value: resolvedCoA.id, label: `${resolvedCoA.code} - ${resolvedCoA.name}` }
      }
      return { value: null, label: 'No Account' }
    }
    return null
  }, [importedChartOfAccounts, resolvedMappings])

  const chartOfAccounts: any = useMemo(() => {
    const groupedAccounts = {}
    importedChartOfAccounts
      ?.filter((account) => account.id !== id)
      .forEach((item) => {
        if (!groupedAccounts[item.type]) {
          groupedAccounts[item.type] = [
            {
              value: item.id,
              label: `${item.code} - ${item.name}`
            }
          ]
        } else {
          groupedAccounts[item.type].push({
            value: item.id,
            label: `${item.code} - ${item.name}`
          })
        }
      })
    const accountOptions = Object.entries(groupedAccounts)
      .map(([key, options]) => ({
        label: key,
        options
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return [
      {
        value: null,
        label: 'No Account'
      },
      ...accountOptions
    ]
  }, [importedChartOfAccounts])

  const handleOnChange = (_options) => {
    onClickResolve({
      newCOAId: _options.value,
      previousCOAId: id
    })
  }

  return (
    <div>
      <div>
        <Typography variant="body2" classNames="font-semibold mb-2" color="primary">
          Current Linked Account
        </Typography>
        <Dropdown options={[]} disabled value={{ value: '111', label: `${code} - ${name}` }} />
      </div>
      <div className="mt-4 h-[410px]">
        <Typography variant="body2" classNames="font-semibold mb-2" color="primary">
          New Linked Account
        </Typography>
        <Dropdown
          placeholder="Select account"
          sizeVariant="medium"
          options={chartOfAccounts}
          showCaret
          value={resolvedOption}
          onChange={handleOnChange}
          formatOptionLabel={FormatCoAOptionLabel}
        />
      </div>
    </div>
  )
}
export default MappingCard
