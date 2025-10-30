/* eslint-disable no-unneeded-ternary */
import React, { useEffect } from 'react'
import Button from '@/components-v2/atoms/Button'
import { UseFormReturn, Controller } from 'react-hook-form'

import Warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import TextField from '@/components/TextField/TextField'
import { useRouter } from 'next/router'
import SelectDropdown from '@/components-v2/Select/Select'
import Typography from '@/components-v2/atoms/Typography'
import BigClose from '@/public/svg/BigClose.svg'

interface IMemberinviteProps {
  onSubmit: (data: any) => void
  fullWidth?: boolean
  form: UseFormReturn
  apiError: any
  serverError: any
  isSuccess: boolean
  isError: boolean
  isLoading: boolean
  handleOnCloseModal: any
  role: any
  setInvitedCredential: (credential: string) => void
}

const CREDENTIALS_PLACEHOLDER = {
  email: "Enter team member's email",
  wallet: "Enter team member's wallet address"
}

const TempErrorComponent = ({ error }) => {
  if (error) {
    return (
      <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D]">
        <div className="mr-2 flex items-center">
          <Image src={Warning} alt="warning" />
        </div>
        {error}
      </div>
    )
  }
  return null
}

const InviteMember: React.FC<IMemberinviteProps> = ({
  onSubmit,
  form,
  handleOnCloseModal,
  serverError,
  apiError,
  isSuccess,
  isError,
  isLoading,
  role,
  setInvitedCredential
}) => {
  const router = useRouter()
  const { organizationId = '' } = router.query
  const { handleSubmit, watch, reset, control, formState } = form

  const parseApi = (_apiError) => {
    switch (true) {
      case _apiError && _apiError.includes('email'):
        return 'Email format is invalid.'
      case _apiError && _apiError.includes('invited'):
        return 'A user with with these credentials have been invited.'
      case _apiError && _apiError.includes('exists'):
        return 'A member with these credentials already exists.'
      default:
        return _apiError
    }
  }

  const handleOnSubmit = (data) => {
    const isEmail = data.loginType.value === 'email' ? true : false
    onSubmit({
      orgId: String(organizationId),
      payload: {
        address: !isEmail ? data.credential : null,
        firstName: data.firstName.replace(/\s+/g, ' '),
        lastName: data.lastName.replace(/\s+/g, ' '),
        role: data.role.value,
        email: isEmail ? data.credential : null,
        message: data.message ?? null
      }
    })
    setInvitedCredential(data.credential.trim())
  }

  const ROLE_MAP = {
    Owner: [
      // { value: 'Employee', label: 'Employee' },
      { value: 'Admin', label: 'Admin' }
    ],
    // Admin: [{ value: 'Employee', label: 'Employee' }]
    Admin: [{ value: 'Admin', label: 'Admin' }]
  }

  const { errors } = formState
  return (
    <div className=" w-[600px]  bg-white  rounded-3xl shadow-home-modal">
      <div className="p-8 font-inter">
        <div className="flex justify-between w-full items-center">
          <Typography classNames="flex items-center" variant="heading3" color="dark">
            Invite New Member
          </Typography>

          <Image className="cursor-pointer" onClick={handleOnCloseModal} src={BigClose} height={40} width={40} />
        </div>
        <Typography variant="body2" color="primary">
          Enter member details and create invitation.
        </Typography>
      </div>
      <hr className="-mt-2" />
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <section id="modal-body" className="p-4 px-8 font-inter">
          <div className="flex flex-row gap-4">
            <div className="basis-1/2">
              <TextField
                control={control}
                label="First Name*"
                name="firstName"
                placeholder="John"
                errors={formState.errors}
              />
            </div>
            <div className="basis-1/2">
              <TextField
                control={control}
                label="Last Name*"
                name="lastName"
                placeholder="Doe"
                errors={formState.errors}
              />
            </div>
          </div>
          <div className="mt-4">
            <p className="pb-4 text-sm font-inter font-medium text-[#344054]">Role*</p>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <SelectDropdown disableIndicator {...field} name="role" options={ROLE_MAP[role]} />
              )}
            />
            {/* @ts-ignore  */}
            <TempErrorComponent error={formState.errors?.role?.label?.message} />
          </div>
          <div className="mt-6">
            <Typography variant="body1">Member Sign Up Preference*</Typography>
            <Typography classNames="mb-3" variant="caption">
              Member can only use the entered email/wallet address to sign in/sign up via the invite link.
            </Typography>
            <div className="flex flex-row p-1" style={{ border: '1px solid #F1F1EF' }}>
              <div className="basis-1/4">
                <Controller
                  control={control}
                  name="loginType"
                  render={({ field }) => (
                    <SelectDropdown
                      {...field}
                      customBorder="1px"
                      disableIndicator
                      name="loginType"
                      options={[
                        { value: 'email', label: 'E-Mail' },
                        { value: 'wallet', label: 'Wallet' }
                      ]}
                    />
                  )}
                />
              </div>

              <div className="basis-3/4">
                <TextField
                  extendInputClassName="border-none"
                  control={control}
                  name="credential"
                  placeholder={
                    CREDENTIALS_PLACEHOLDER[watch('loginType')?.value] ?? 'Please select a login credential type'
                  }
                />
              </div>
            </div>
            {/* @ts-ignore */}
            {apiError && <TempErrorComponent error={parseApi(apiError)} />}
            {/* @ts-ignore */}
            <TempErrorComponent error={errors?.credential?.message || errors?.loginType?.label.message} />
          </div>
          <div className="mt-6">
            <TextField
              control={control}
              multiline
              label="Message to Member (optional)"
              name="message"
              placeholder="Hi, please join my team."
            />
          </div>
        </section>
        <hr className="" />
        <section id="modal-footer" className="flex flex-row font-inter p-6 gap-4 px-8">
          <Button variant="grey" height={48} onClick={handleOnCloseModal} label="Cancel" disabled={isLoading} />
          <Button
            variant="black"
            height={48}
            type="submit"
            width="w-full"
            label="Create Invitation"
            loading={isLoading}
            disabled={isLoading}
          />
        </section>
      </form>
    </div>
  )
}
export default InviteMember
