import SelectDropdown from '@/components-v2/Select/Select'
import { FormGroup } from '@/components-v2/molecules/Forms'
import { ExportTo, ExportType } from '../interface'
import ExportOptionLabel from './ExportOptionLabel'

const ExportJournalEntries: React.FC<{
  exportTypeOptions: { value: ExportType; label: string }[]
  exportToOptions: { value: ExportTo; label: string }[]
  exportType: { value: ExportType; label: string }
  exportTo: { value: ExportTo; label: string }
  onChangeExportType: (exportType: { value: ExportType; label: string }) => void
  onChangeExportTo: (exportTo: { value: ExportTo; label: string }) => void
}> = ({ exportTypeOptions, exportToOptions, exportType, exportTo, onChangeExportType, onChangeExportTo }) => (
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
          options={exportToOptions}
          formatOptionLabel={ExportOptionLabel}
          className="font-normal"
        />
      </FormGroup>
    </div>
  </div>
)

export default ExportJournalEntries
