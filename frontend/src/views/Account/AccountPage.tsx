/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import { useEffect } from 'react'
import * as Yup from 'yup'
import type { NextPage } from 'next'
import { toast } from 'react-toastify'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import TextField from '@/components/TextField/TextField'
import { useGetUserAccountQuery, useUpdateAuthenticatedAccountMutation } from '@/api-v2/account-api'
import FormErrorLabel from '@/components/FormErrorLabel/FormErrorLabel'
import { useAppDispatch } from '@/state'
import { accountSlice } from '@/slice/account/account-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required')
})

const ProfilePage: NextPage = () => {
  const { data: userAccount } = useGetUserAccountQuery({})
  const [updateMemberApi, updateMemberApiResult] = useUpdateAuthenticatedAccountMutation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (updateMemberApiResult.isSuccess) {
      dispatch(accountSlice.actions.setAccount(updateMemberApiResult?.data?.data))

      toast.success('Member data updated')
    } else if (updateMemberApiResult.isError) {
      if (updateMemberApiResult.error.status === 500) {
        toast.error('Sorry, an unexpected error occurred')
      } else {
        toast.error(updateMemberApiResult?.error?.message ?? 'Sorry, an error has occurred')
      }
    }
  }, [updateMemberApiResult])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all',
    shouldUnregister: false,
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: userAccount?.data?.firstName,
      lastName: userAccount?.data?.lastName
    }
  })

  useEffect(() => {
    reset({
      firstName: userAccount?.data?.firstName,
      lastName: userAccount?.data?.lastName
    })
  }, [userAccount, reset])

  const onClickSubmit = (formData: any) => {
    updateMemberApi(formData)
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Account Settings</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <Header.Right.PrimaryCTA label="Save Changes" onClick={handleSubmit(onClickSubmit)} />
        </Header.Right>
      </Header>
      <View.Content>
        <div className="flex flex-row gap-6 px-8 pt-8">
          <div className="basis-1/2">
            <TextField
              extendInputClassName="bg-[#FBFAFA] mb-2"
              control={control}
              name="firstName"
              label="First name"
              placeholder="Enter first name"
            />
            <FormErrorLabel error={errors?.firstName?.message} />
          </div>
          <div className="basis-1/2">
            <TextField
              extendInputClassName="bg-[#FBFAFA] mb-2"
              control={control}
              name="lastName"
              label="Last name"
              placeholder="Enter last name"
            />
            <FormErrorLabel error={errors?.lastName?.message} />
          </div>
        </div>
      </View.Content>
    </>
  )
}

export default ProfilePage
