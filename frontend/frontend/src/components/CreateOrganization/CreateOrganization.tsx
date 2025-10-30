import { IOrganization, EOrganizationType } from '@/slice/organization/organization.types'
import { useCreateOrganizationMutation } from '@/slice/organization/organization.api'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import { EProcessStatus } from '@/views/Organization/interface'
import { logEvent } from '@/utils/logEvent'
import Typography from '@/components-v2/atoms/Typography'

interface ICreateOrganiztion {
  onBack: () => void
  isNotModal?: boolean
  setError?: (error: string) => void
  setStatus?: (status: EProcessStatus) => void
}

const CreateOrganization: React.FC<ICreateOrganiztion> = ({ onBack, isNotModal, setError, setStatus }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<IOrganization>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      type: EOrganizationType.DAO
    }
  })
  const router = useRouter()
  const [triggerCreateOrganization, createOrganizationResponse] = useCreateOrganizationMutation()

  useEffect(() => {
    if (createOrganizationResponse.isSuccess) {
      logEvent({
        event: 'create_organisation_in_app',
        payload: {
          event_category: 'Full app',
          event_label: '',
          value: 1
        }
      })
      router.push(`/${createOrganizationResponse?.data?.data?.publicId}/dashboard`)
    } else if (createOrganizationResponse.isError) {
      if (createOrganizationResponse?.error?.status === 400) {
        setError(createOrganizationResponse?.error?.data?.message)
      } else {
        setError('There was an error creating the organisation')
      }
    }
  }, [createOrganizationResponse])

  const submitChange = (data: IOrganization) =>
    triggerCreateOrganization({
      name: data.name,
      type: data.type
    })

  return (
    <form onSubmit={handleSubmit(submitChange)}>
      <div className="p-8 font-inter ">
        <div className="flex justify-between items-center mb-2 border-modal ">
          <Typography variant="body2" color="dark">
            Name your organisation
          </Typography>
        </div>

        <div>
          <input
            data-test-id="organization-name"
            {...register('name', {
              required: { value: true, message: 'This name is required' },
              maxLength: { value: 200, message: 'The organization name  must not exceed 200 characters.' },
              onBlur: (event: any) => setValue('name', event.target.value.trim(), { shouldValidate: false })
            })}
            className=" focus:outline-none focus:border-gray-700 text-sm text-gray-700  w-full h-10 font-inter border-input-border border rounded flex gap-4 items-center px-4"
            type="text"
            placeholder="Organisation Name"
          />
          {errors && errors.name && (
            <div className="text-sm font-inter flex items-center text-[#E83F6D]">
              <div className="mr-2 flex items-center">
                <Image src={warning} alt="warning" width={16} height={16} />
              </div>
              {errors.name.message}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-[#EAECF0]" />

      <div className=" m-8 gap-4 flex">
        <button
          onClick={() => {
            reset()
            if (onBack) {
              onBack()
            }
          }}
          type="button"
          className=" py-4 px-8 font-semibold  rounded-[4px] text-base hover:bg-gray-300 text-dashboard-main font-inter bg-[#F2F4F7]"
        >
          Back
        </button>
        <button
          disabled={createOrganizationResponse.isLoading}
          type="submit"
          className=" py-4 cursor-pointer  w-full text-center font-semibold rounded-[4px] text-base hover:bg-grey-901 text-white font-inter bg-grey-900"
        >
          Continue
        </button>
      </div>
    </form>
  )
}

export default CreateOrganization
