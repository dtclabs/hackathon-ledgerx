import Typography from '@/components-v2/atoms/Typography'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'

const OrganisationBasicInformation = ({ control, errors }) => (
  <div className="rounded-lg border border-grey-200">
    <div className="bg-[#F9FAFB] rounded-t-lg p-4">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Basic Information
      </Typography>
    </div>
    <div className="flex flex-col gap-6 p-4">
      <div>
        <div className="flex items-center">
          <div className="w-[250px]">
            <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
              Organisation Name <span className="text-error-500 font-semibold">*</span>
            </Typography>
          </div>
          <TextField control={control} errorClass="mt-1" name="organizationName" placeholder="Organisation Name*" />
        </div>
        {errors && errors?.organizationName && (
          <div className="ml-[250px]">
            <HelperText helperText={errors?.organizationName.message} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <div className="w-[250px]">
            <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
              Organisation Mailing Address <span className="text-error-500 font-semibold">*</span>
            </Typography>
          </div>
          <TextField
            control={control}
            errorClass="mt-1"
            name="organizationAddress"
            placeholder="Organisation Mailing Address *"
          />
        </div>
        {errors && errors?.organizationAddress && (
          <div className="ml-[250px]">
            <HelperText helperText={errors?.organizationAddress.message} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <div className="w-[250px]">
            <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
              Contact Person <span className="text-error-500 font-semibold">*</span>
            </Typography>
          </div>
          <TextField control={control} errorClass="mt-1" name="contactName" placeholder="Contact Person*" />
        </div>
        {errors && errors?.contactName && (
          <div className="ml-[250px]">
            <HelperText helperText={errors?.contactName.message} />
          </div>
        )}
      </div>
    </div>
  </div>
)

export default OrganisationBasicInformation
