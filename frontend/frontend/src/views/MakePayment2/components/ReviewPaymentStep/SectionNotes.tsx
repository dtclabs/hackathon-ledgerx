import { useFormContext } from 'react-hook-form'
import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'

const SectionAdditionalDetails = () => {
  const { formState, watch, setValue } = useFormContext()

  return (
    <div className="w-full text-dashboard-main text-sm">
      <Typography classNames="tracking-[0.02em] !text-dashboard-darkMain mb-3" variant="subtitle1">
        Remarks (optional)
      </Typography>
      <div className="border rounded-2xl p-4 w-full">
        <div>
          <Typography classNames="mb-4">Add Notes</Typography>
          <TextField
            onChangeTextArea={(e) => {
              setValue('notes', e.target.value)
            }}
            value={watch('notes')}
            name="notes"
            multiline
            rows={5}
            placeholder="Enter your message..."
            classNameInput="focus:outline-none border-[#EAECF0] text-sm text-gray-700 placeholder:text-[#B5B5B3] placeholder:leading-5 w-full font-inter border rounded-lg p-4 focus:"
          />
        </div>

        <div>{formState.errors.files && <HelperText helperText={formState.errors.files.message as string} />}</div>
      </div>
    </div>
  )
}

export default SectionAdditionalDetails
