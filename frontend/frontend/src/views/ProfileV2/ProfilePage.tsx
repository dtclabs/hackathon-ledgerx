/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable arrow-body-style */
import { useEffect, useMemo, useState, Fragment } from 'react'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { ethers } from 'ethers'
import { setCurrentPage } from '@/state/global/actions'
import type { NextPage } from 'next'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import FormErrorLabel from '@/components/FormErrorLabel/FormErrorLabel'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components-v2/Button'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { useGetAuthenticatedProfileQuery, useUpdateMemberMutation } from '@/api-v2/members-api'
import { ContactDropdown, NetworkDropdown } from '@/views/ProfileV2'
import { WelcomeModal } from '../Invite/WelcomeModal'
import { useAppSelector } from '@/state'
import { userSelectors } from '@/state/user/reducer'
import { useGetCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import _ from 'lodash'
import Loading from '@/components/Loading'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { userOrganizationsSelector } from '@/slice/account/account-slice'
import Typography from '@/components-v2/atoms/Typography'

const validationSchema = Yup.object().shape({
  addresses: Yup.array().of(
    Yup.object().shape({
      blockchainId: Yup.string(),
      cryptocurrencySymbol: Yup.string(),
      address: Yup.string()
    })
  ),
  contacts: Yup.array().of(
    Yup.object().shape({
      providerId: Yup.string(),
      content: Yup.string()
    })
  )
})

const ProfilePage: NextPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const showBanner = useAppSelector(showBannerSelector)
  const selectedChain = useAppSelector(selectedChainSelector)

  const { organizationId = '' } = router.query

  const { data: chainData, isSuccess: isChainsSuccess, isLoading: chainLoading } = useGetChainsQuery({})

  const {
    data: tokenData,
    isSuccess: isTokensSuccess,
    isLoading: tokenLoading
  } = useGetCryptoCurrenciesQuery(
    {
      blockchainIds: chainData?.data?.map((chain) => chain.id)
    }
    // { skip: chainData?.data.length > 0 }
  )
  const { data, isLoading } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )
  const [updateMemberApi, updateMemberApiResult] = useUpdateMemberMutation()

  const [showModal, setShowModal] = useState(false)
  const showWelcome = useAppSelector(userSelectors.showWelcomeSelector)
  const myOrganizations = useAppSelector(userOrganizationsSelector)
  const currentOrganization = myOrganizations?.find((item) => item.id === organizationId)

  useEffect(() => {
    dispatch(setCurrentPage('Profile'))
  }, [])

  useEffect(() => {
    if (updateMemberApiResult.isSuccess) {
      toast.success('Member data updated')
    } else if (updateMemberApiResult.isError) {
      if (updateMemberApiResult?.error?.data?.message) {
        toast.error(updateMemberApiResult?.error?.data?.message)
      } else {
        toast.error('Sorry, an unexpected error occured')
      }
    }
  }, [updateMemberApiResult])

  useEffect(() => {
    if (showWelcome) setShowModal(true)
  }, [showWelcome])

  const chainOptions = useMemo(() => {
    return chainData?.data?.map((chain) => ({ value: chain.id, label: chain.name.split(' ')[0] }))
  }, [chainData?.data])

  const tokenOptions = useMemo(() => {
    return tokenData?.data
      ?.filter((token) => token.isVerified)
      .map((_token) => ({
        value: _token.symbol,
        label: _token.name,
        img: _token.image.small
      }))
  }, [tokenData?.data])

  const renderFormValues = () => ({
    addresses:
      data?.data?.addresses.length > 0
        ? data?.data?.addresses
        : [
            {
              blockchainId: chainOptions?.[0]?.value,
              cryptocurrencySymbol: 'ETH',
              address: ''
            }
          ],
    contacts:
      data?.data?.contacts.length > 0
        ? data?.data?.contacts
        : [
            {
              providerId: '1',
              content: ''
            }
          ]
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    setError,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all',
    shouldUnregister: false,
    resolver: yupResolver(validationSchema),
    defaultValues: renderFormValues()
  })

  useEffect(() => {
    reset(renderFormValues())
  }, [isLoading, isChainsSuccess, isTokensSuccess])

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress
  } = useFieldArray({
    control,
    name: 'addresses'
  })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact
  } = useFieldArray({
    control,
    name: 'contacts'
  })

  const checkDuplicates = (list) => {
    const duplicatedList = list.map((item1, index1) => {
      const equal = list.find((item2, index2) => {
        if (index1 > index2) {
          return (item1?.content || item1?.address) && _.isEqual(item1, item2)
        }
        return false
      })

      if (equal) {
        return { ...item1, isDuplicate: true }
      }
      return item1
    })
    return duplicatedList
  }

  const onClickSubmit = (formData: any) => {
    let hasError = false

    checkDuplicates(formData.contacts).forEach((contact, index) => {
      if (contact.isDuplicate) {
        hasError = true
        setError(`contacts.${index}.content`, { type: 'custom', message: 'Duplicate contact' })
      }
    })

    checkDuplicates(formData.addresses).forEach((address, index) => {
      if (address.isDuplicate) {
        hasError = true
        setError(`addresses.${index}.address`, { type: 'custom', message: 'Duplicate address' })
      }
    })

    for (const [i, v] of formData.addresses.entries()) {
      if (v.address && !ethers.utils.isAddress(v.address)) {
        hasError = true
        setError(`addresses.${i}.address`, { type: 'custom', message: 'Invalid address format' })
      }
    }

    formData.addresses = formData.addresses.filter((address) => {
      const addressValues = Object.values(address)
      if (!addressValues.some((value) => value === '')) {
        return address
      }
      return null
    })

    formData.contacts = formData.contacts.filter((address) => {
      const addressValues = Object.values(address)
      if (!addressValues.some((value) => value === '')) {
        return address
      }
      return null
    })

    if (!hasError) {
      updateMemberApi({ orgId: String(organizationId), data: formData })
    }
  }

  const handleAddAnotherWallet = () => {
    appendAddress({
      blockchainId: 'ethereum',
      cryptocurrencySymbol: 'ETH',
      address: ''
    })
  }

  const handleAddAnotherContact = () => {
    appendContact({
      providerId: '1',
      content: ''
    })
  }

  const handleOnClickRemoveAddress = (_index) => {
    const addressess = getValues('addresses')
    if (addressess.length > 1) {
      removeAddress(_index)
    } else {
      setValue('addresses.0.blockchainId', 'ethereum')
      setValue('addresses.0.cryptocurrencySymbol', 'ETH')
      setValue('addresses.0.address', '')
      trigger('addresses.0.address')
    }
  }

  const handleOnClickRemoveContact = (_index) => {
    const contacts = getValues('contacts')
    if (contacts.length > 1) {
      removeContact(_index)
    } else {
      setValue('contacts.0.providerId', '1')
      setValue('contacts.0.content', '')

      trigger('contacts.0.providerId')
    }
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>My Organisation Profile</Header.Left.Title>
        </Header.Left>
      </Header>
      <View.Content>
        {isLoading || chainLoading || tokenLoading ? (
          <Loading dark title="Fetching Data" />
        ) : (
          <div className="border rounded-lg pb-8">
            <div className="px-8 pt-8">
              <Typography variant="body1" styleVariant="semibold">
                Basic Information
              </Typography>
              <div className="flex mt-4">
                <Typography classNames="w-[300px]" variant="body2" color="primary">
                  Organisation Name
                </Typography>
                <Typography classNames="w-[300px]" variant="body2" color="primary">
                  {currentOrganization?.name}
                </Typography>
              </div>
              <div className="flex mt-6">
                <Typography classNames="w-[300px]" variant="body2" color="primary">
                  Your Role
                </Typography>
                <Typography classNames="w-[300px]" variant="body2" color="primary">
                  {data?.data?.role}
                </Typography>
              </div>
              <Typography variant="body1" classNames=" mt-8" styleVariant="semibold">
                Wallets
              </Typography>
              <Typography classNames="mt-2 mb-4" variant="body2" color="secondary">
                Add your preferred wallet addresses to receive funds.
              </Typography>
              {addressFields.map((addressBlock, index) => {
                return (
                  <Fragment key={index}>
                    <NetworkDropdown
                      index={index}
                      onClickRemoveAddress={handleOnClickRemoveAddress}
                      trigger={trigger}
                      setValue={setValue}
                      tokens={tokenOptions}
                      networks={chainOptions}
                      key={addressBlock.id}
                      watch={watch}
                      register={register}
                    />
                    <FormErrorLabel
                      error={
                        errors?.addresses?.[index]?.blockchainId?.message ||
                        errors?.addresses?.[index]?.cryptocurrencySymbol?.message ||
                        errors?.addresses?.[index]?.address?.message
                      }
                    />
                  </Fragment>
                )
              })}
              <Button onClick={handleAddAnotherWallet} className="mt-4" variant="outlined" size="sm">
                + Add Another Address
              </Button>
            </div>

            <div className="px-8 pt-8 mt-4">
              <Typography variant="body1" styleVariant="semibold">
                Contact Details
              </Typography>
              {contactFields.map((addressBlock, index) => {
                return (
                  <Fragment key={index}>
                    <ContactDropdown
                      onClickRemoveAddress={handleOnClickRemoveContact}
                      watch={watch}
                      setValue={setValue}
                      trigger={trigger}
                      index={index}
                      key={index}
                    />
                    <FormErrorLabel
                      error={
                        errors?.contacts?.[index]?.providerId?.message || errors?.contacts?.[index]?.content?.message
                      }
                    />
                  </Fragment>
                )
              })}

              <Button onClick={handleAddAnotherContact} className="mt-4" variant="outlined" size="sm">
                + Add Another Contact Detail
              </Button>
            </div>
            <div className="px-8 pt-8">
              <Button size="md" onClick={handleSubmit(onClickSubmit)}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </View.Content>
      {data?.data?.role && (
        <WelcomeModal
          setShowModal={setShowModal}
          showModal={showModal}
          firstName={data?.data?.firstName}
          lastName={data?.data?.lastName}
          orgName={currentOrganization?.name ? currentOrganization.name : 'the team'}
          organizationId={String(organizationId)}
          role={data?.data?.role}
        />
      )}
    </>
  )
}

export default ProfilePage
