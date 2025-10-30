import { useUpdateOrganizationMutation } from '@/slice/organization/organization.api'
import { FormField, Input } from '@/components-v2'
import { useAppDispatch } from '@/state'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import * as Yup from 'yup'
import ConfirmModal from '../ConfirmModal'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'

interface IBasicSettingForm {
  orgName: string
}

const validationSchema = Yup.object().shape({
  orgName: Yup.string().trim().required('Organisation name cannot be empty.')
})

const BasicSetting = ({ organization, showBanner, activeTab, userData }) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<IBasicSettingForm>({
    defaultValues: {
      orgName: organization?.name || ''
    },
    resolver: yupResolver(validationSchema)
  })
  const dispatch = useAppDispatch()

  const [updateOrg, updateOrgResult] = useUpdateOrganizationMutation()
  const [getMyOrganizationSuccess, setOrganizationSuccess] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [showError, setShowError] = useState(false)

  const orgName = watch('orgName')

  useEffect(() => {
    if (organization?.name) {
      reset({
        orgName: organization?.name
      })
    }
  }, [organization?.name, activeTab])

  useEffect(() => {
    if (updateOrgResult.isSuccess) {
      setConfirm(false)
      toast.success('Organisation name updated')
    }
    if (updateOrgResult.isError) {
      setConfirm(false)
      setShowError(true)
    }
  }, [updateOrgResult])

  const handleSave = (data: IBasicSettingForm) => {
    setConfirm(true)
  }

  const handleConfirm = () => {
    updateOrg({
      orgId: organization.id,
      data: {
        id: String(organization.id),
        name: orgName,
        type: organization.type
      }
    })
  }

  const handleResetDefaults = () => {
    if (organization?.name) {
      reset({
        orgName: organization?.name
      })
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit(handleSave)}>
        <div className={`${showBanner ? 'h-[calc(100vh-462px)]' : 'h-[calc(100vh-394px)]'} overflow-auto scrollbar`}>
          <div className="flex items-start">
            <Typography variant="body2" classNames="w-[300px] mt-[20px]">
              Organisation Name
            </Typography>
            <Controller
              control={control}
              name="orgName"
              render={({ field }) => (
                <FormField className="w-[400px]" error={errors?.orgName?.message}>
                  <Input
                    {...field}
                    placeholder="Acme Inc."
                    reset={orgName?.length > 0 && userData?.data?.role === 'Owner'}
                    handleReset={() => {
                      reset({
                        orgName: ''
                      })
                    }}
                    style={{ height: '40px' }}
                    disabled={userData?.data?.role !== 'Owner'}
                  />
                </FormField>
              )}
            />
          </div>
        </div>
        <div className="bg-white flex justify-end gap-3 py-6 border-t border-grey-200 w-full">
          <Button height={40} type="button" variant="grey" onClick={handleResetDefaults} label="Cancel" />
          <div data-tip="disabled-edit-org" data-for="disabled-edit-org">
            <Button
              type="submit"
              variant="black"
              disabled={userData?.data?.role !== 'Owner' || orgName === organization?.name}
              label="Save Changes"
              height={40}
            />
            {userData?.data?.role !== 'Owner' && (
              <ReactTooltip
                id="disabled-edit-org"
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                place="top"
                className="!opacity-100 !rounded-lg"
              >
                Only owners can perform this action
              </ReactTooltip>
            )}
          </div>
        </div>
      </form>
      <ConfirmModal
        isLoading={updateOrgResult.isLoading}
        showModal={confirm}
        setShowModal={setConfirm}
        onAccept={handleConfirm}
        title="Save Organisation Name?"
        subTitle="Are you sure you want to update the organisation name?"
      />
      <NotificationPopUp
        type="error"
        setShowModal={setShowError}
        showModal={showError}
        title="Error"
        description={updateOrgResult.error?.data?.message}
        onClose={() => {
          setShowError(false)
        }}
        acceptText="Dismiss"
      />
    </div>
  )
}

export default BasicSetting
