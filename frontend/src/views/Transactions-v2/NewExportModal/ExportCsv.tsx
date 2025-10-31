import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'
import Typography from '@/components-v2/atoms/Typography'
import { FormGroup } from '@/components-v2/molecules/Forms'
import SelectDropdown from '@/components-v2/Select/Select'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import { useEffect, useState } from 'react'

const mockColumns = [
  'Date & Time',
  'Txn Hash',
  'Type',
  'From Wallet',
  'To Wallet',
  'Token Name',
  'Token Amount in',
  'Token Amount Out',
  'Fiat Value In',
  'Fiat Value Out',
  'Realised Gains/Loss',
  'Account',
  'Notes',
  'Blockchain'
] // TODO: These will be fetched from the BE when ready. Might have to turn it into {id, label} pair if need be.

const showColumns = false // Turn it to false for first part of release. To be removed once we have columns API (both GET and export) ready

const ExportCsv = ({
  onSelectCsvExportType,
  totalItems,
  exportType,
  filteredItems,
  selectedItems,
  totalUnfilteredItems
}) => {
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))
  const [selectedColumns, setSelectedColumns] = useState([])

  useEffect(() => {
    if (
      window.localStorage.getItem('csv-selected-columns') &&
      JSON.parse(window.localStorage.getItem('csv-selected-columns')).length > 0
    ) {
      setSelectedColumns(JSON.parse(window.localStorage.getItem('csv-selected-columns')))
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('csv-selected-columns', JSON.stringify(selectedColumns))
  }, [selectedColumns])

  const renderTotalItems = () => {
    if (exportType?.value === 'csv-all') {
      return `${totalUnfilteredItems}`
    }
    if (exportType?.value === 'csv-selected') {
      return `${selectedItems === 0 ? filteredItems : selectedItems}`
    }
    return ''
  }

  const handleColumnSelect = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((columnName) => columnName !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="flex-1">
          <FormGroup label="Select data">
            <SelectDropdown
              name="export-type"
              onChange={onSelectCsvExportType}
              options={[
                {
                  value: 'csv-all',
                  label: isNewExportsCSVEnabled ? `All (${filteredItems})` : 'All (Recommended)'
                },
                {
                  value: 'csv-selected',
                  label: `Current selection (${selectedItems})`,
                  disabled: !selectedItems
                }
              ]}
              value={exportType}
            />
          </FormGroup>
        </div>

        {exportType?.value && !isNewExportsCSVEnabled && (
          <div className="absolute right-0">
            <Typography color="secondary" variant="caption">
              No of Txns. <b>{renderTotalItems()}</b>
            </Typography>
          </div>
        )}
      </div>
      {showColumns && (
        <div className="mt-8">
          <FormGroup label="Select columns">
            <div className="flex flex-wrap gap-2">
              {mockColumns.map((column) => (
                <CheckboxCustom
                  label={column}
                  onChange={() => handleColumnSelect(column)}
                  checkboxGroupName="columns"
                  id={column}
                  checked={selectedColumns.includes(column)}
                />
              ))}
            </div>
          </FormGroup>
        </div>
      )}
    </div>
  )
}

export default ExportCsv
