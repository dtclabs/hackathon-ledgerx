import SelectDropdown from '@/components-v2/Select/Select'
import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'
import { FormGroup } from '@/components-v2/molecules/Forms'
import CsvIcon from '@/public/svg/icons/csv-icon.svg'
import React, { useEffect, useState } from 'react'
import { EXPORT_COLUMNS, ExportTo, ExportType, FILE_TYPE } from '../interface'
import ExportOptionLabel from './ExportOptionLabel'

const showColumns = false

const ExportTxn: React.FC<{
  exportTypeOptions: { value: ExportType; label: string }[]
  exportType: { value: ExportType; label: string }
  exportTo: { value: ExportTo; label: string }
  onChangeExportType: (exportType: { value: ExportType; label: string }) => void
  onChangeExportTo: (exportTo: { value: ExportTo; label: string }) => void
}> = ({ exportTypeOptions, exportType, exportTo, onChangeExportType, onChangeExportTo }) => {
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

  const handleColumnSelect = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((columnName) => columnName !== column))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  return (
    <div className="relative flex flex-col gap-6">
      <div className="flex-1">
        <FormGroup label="Select Data" extendClass="font-semibold">
          <SelectDropdown
            name="export-type"
            value={exportType}
            onChange={onChangeExportType}
            options={exportTypeOptions}
            className="font-normal"
          />
        </FormGroup>
      </div>
      <div className="flex-1">
        <FormGroup label="Export to" extendClass="font-semibold">
          <SelectDropdown
            name="export-to"
            value={exportTo}
            onChange={onChangeExportTo}
            options={[{ value: ExportTo.CSV, label: FILE_TYPE[ExportTo.CSV], icon: CsvIcon }]}
            className="font-normal"
            formatOptionLabel={ExportOptionLabel}
          />
        </FormGroup>
      </div>
      {showColumns && (
        <div className="mt-8">
          <FormGroup label="Select columns">
            <div className="flex flex-wrap gap-2">
              {EXPORT_COLUMNS.map((column) => (
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

export default ExportTxn
