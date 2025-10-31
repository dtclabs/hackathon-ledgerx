/* eslint-disable no-useless-escape */
/* eslint-disable react/no-array-index-key */
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useEffect, useState } from 'react'
import { usePostSubscriptionRequestMutation } from '@/api-v2/subscription-api'
import { toast } from 'react-toastify'
import { useFieldArray, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import ContactDropdown from '@/views/Organization/components/ContactDropdown'
import FormErrorLabel from '@/components/FormErrorLabel/FormErrorLabel'
import Image from 'next/legacy/image'
import warning from '@/public/svg/light-warning-icon.svg'

const PLAN_NAMES = {
  starter: 'Starter',
  business: 'Business',
  partnersProgram: 'Partner Program'
}

interface IAddContactForm {
  contacts: { provider: string; content: string }[]
}

const validateEmail = (email) => {
  const emailRegex =
    /^[^<>()[\]\\,;:\%#^\s@\"$&!@]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$/gm
  if (!emailRegex.test(email)) {
    return false
  }
  return true
}

const validateWhatsapp = (value) => {
  const whatsApp =
    /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d*)\)?)[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?)+)(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i
  if (!whatsApp.test(value)) {
    return false
  }
  return true
}

const validationSchema = Yup.object().shape({
  contacts: Yup.array()
    .of(
      Yup.object().shape({
        provider: Yup.string().required(),
        content: Yup.string().trim()
      })
    )
    .test('checkContactRequired', 'Please provide at least one point of contact', (value) =>
      value.some((contact) => contact.content.trim() !== '')
    )
    .test('validEmail', 'Please provide a valid email', (value) => {
      for (const item of value) {
        if (item.provider === 'Email' && item.content.trim() && !validateEmail(item.content.trim())) return false
      }
      return true
    })
    .test('validWhatsapp', 'Please provide a valid contact number', (value) => {
      for (const item of value) {
        if (item.provider === 'WhatsApp' && item.content.trim() && !validateWhatsapp(item.content.trim())) return false
      }
      return true
    })
})

const SubmitRequestModal = ({ provider, chosenPlanDetails, handleSwitchModalOnSuccess, isUpgrade }) => {
  const [isClickSubmit, setIsClickSubmit] = useState(false)
  const organizationId = useOrganizationId()
  const [postSubscriptionRequest, postSubscriptionRequestResult] = usePostSubscriptionRequestMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    getValues,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<IAddContactForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      contacts: [{ content: '', provider: 'Email' }]
    }
  })

  const {
    fields: contactFields,
    append: contactAppend,
    remove: contactRemove
  } = useFieldArray<IAddContactForm>({ control, name: 'contacts', keyName: 'id' })

  const handleAddAnotherContact = () => {
    contactAppend({
      provider: 'Email',
      content: ''
    })
  }

  const handleOnClickRemoveContact = (_index) => {
    const contacts = getValues('contacts')
    if (contacts.length > 1) {
      contactRemove(_index)
    } else {
      setValue('contacts.0.provider', 'Email')
      setValue('contacts.0.content', '')
    }
  }

  const submitRequest = async (data) => {
    setIsClickSubmit(true)
    const contacts = data.contacts.filter((contact) => contact.content !== '')
    await postSubscriptionRequest({
      organizationId,
      payload: {
        requestType: isUpgrade ? 'upgrade' : 'interest',
        contactDetails: {
          contacts
        },
        requestDetails: {
          planName: chosenPlanDetails?.planName,
          billingCycle: chosenPlanDetails?.billingCycle
        }
      }
    })
  }

  useEffect(() => {
    if (postSubscriptionRequestResult.isSuccess) {
      const contacts = getValues('contacts')
      reset()
      handleSwitchModalOnSuccess()
      setIsClickSubmit(false)
      triggerSendAnalysis({
        eventType: 'REQUEST_TO_PURCHASE_PLAN',
        metadata: {
          requestType: isUpgrade ? 'upgrade' : 'interest',
          organizationId,
          contactDetails: {
            contacts
          },
          requestDetails: {
            planName: chosenPlanDetails?.planName,
            billingCycle: chosenPlanDetails?.billingCycle
          }
        }
      })
    } else if (postSubscriptionRequestResult.isError) {
      setIsClickSubmit(false)
      toast.error('There was an error submitting your details') // Todo: Check with Prateeksha on this one for copy
    }
  }, [postSubscriptionRequestResult.isSuccess, postSubscriptionRequestResult.isError])

  return (
    <BaseModal provider={provider} classNames="rounded-3xl" width="600">
      <BaseModal.Header>
        <BaseModal.Header.Title>
          Thank you for your interest in {chosenPlanDetails?.planName !== 'partnersProgram' ? 'buying' : ''} the{' '}
          {PLAN_NAMES[chosenPlanDetails?.planName]} Plan!
        </BaseModal.Header.Title>
        <BaseModal.Header.CloseButton
          onClose={() => {
            triggerSendAnalysis({
              eventType: 'CLOSE_PURCHASE_MODAL',
              metadata: {
                requestType: isUpgrade ? 'upgrade' : 'interest',
                organizationId
              }
            })
            provider.methods.setIsOpen(false)
            reset()
          }}
        />
      </BaseModal.Header>
      <BaseModal.Body extendedClass="max-h-[500px] overflow-y-auto">
        <Typography variant="body2" classNames="mt-8 mb-8">
          One of our team members will be in touch with you shortly to help with the payment process and activating your
          account.
        </Typography>
        <Typography variant="subtitle1" classNames="mb-3">
          Please provide at least one point of contact for our team to reach out.
        </Typography>
        <form onSubmit={handleSubmit(submitRequest)}>
          <div className="flex flex-col gap-3">
            {contactFields.map((_, index) => (
              <div key={index}>
                <ContactDropdown
                  onClickRemoveContact={handleOnClickRemoveContact}
                  watch={watch}
                  setValue={setValue}
                  trigger={trigger}
                  index={index}
                  key={index}
                  removeable={index >= 1}
                  clearErrors={clearErrors}
                  setError={setError}
                />
                <FormErrorLabel
                  error={errors?.contacts?.[index]?.provider?.message || errors?.contacts?.[index]?.content?.message}
                />
              </div>
            ))}
            {errors?.contacts?.message && isClickSubmit && (
              <div className="text-xs font-normal flex items-center text-error-500 mt-1 mx-1">
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" width={11} height={11} />
                </div>
                {errors?.contacts?.message}
              </div>
            )}
          </div>
          <Button
            variant="whiteWithBlackBorder"
            height={40}
            label="+ Add Another Contact"
            onClick={handleAddAnotherContact}
            classNames="mt-3"
          />
          <Button
            type="submit"
            width="w-full"
            classNames="mt-8"
            variant="black"
            height={48}
            onClick={() => {
              setIsClickSubmit(true)
            }}
            label="Submit Contact Details"
          />
        </form>
      </BaseModal.Body>
    </BaseModal>
  )
}

export default SubmitRequestModal
