/* eslint-disable camelcase */
import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import FormatCoAOptionLabel from '@/views/ChartOfAccounts/DefaultMapping/components/FormatCoAOptionLabel/FormatCoAOptionLabel'

const MappingCard = ({ name, code, id, onboardingAccounts, onClickResolve, resolvedMappings, ...rest }) => {
  const resolvedOption = useMemo(() => {
    if (resolvedMappings[id]) {
      const resolvedCoA = onboardingAccounts?.find((account) => account.id === resolvedMappings[id].remoteId)
      if (resolvedCoA) {
        return { value: resolvedCoA.id, label: `${resolvedCoA.account_number} - ${resolvedCoA.name}` }
      }
      return { value: null, label: 'No Account' }
    }
    return null
  }, [onboardingAccounts, resolvedMappings])

  const chartOfAccounts: any = useMemo(() => {
    const groupedAccounts = {}
    onboardingAccounts
      ?.filter((account) => account.id !== id)
      .forEach((item) => {
        if (!groupedAccounts[item.type]) {
          groupedAccounts[item.type] = [
            {
              value: item.id,
              label: `${item.account_number} - ${item.name}`
            }
          ]
        } else {
          groupedAccounts[item.type].push({
            value: item.id,
            label: `${item.account_number} - ${item.name}`
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
  }, [onboardingAccounts])

  const handleOnChange = (_options) => {
    onClickResolve({
      remoteId: _options.value,
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
          onChange={handleOnChange}
          value={resolvedOption}
          formatOptionLabel={FormatCoAOptionLabel}
        />
      </div>
    </div>
  )
}
export default MappingCard
