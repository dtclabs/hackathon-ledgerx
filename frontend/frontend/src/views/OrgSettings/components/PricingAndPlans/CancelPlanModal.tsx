import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useEffect, useMemo, useState } from 'react'
import { usePostSubscriptionRequestMutation } from '@/api-v2/subscription-api'
import { toast } from 'react-toastify'
import warningBig from '@/public/svg/warningBig.svg'
import Image from 'next/legacy/image'
import sadFaceBlack from '@/public/svg/icons/sad-face-black.svg'
import styles from '@/components-v2/atoms/CheckBoxCustom/checkboxCustom.module.css'

const REASONS_FOR_CANCELLATION = {
  noFeatures: 'Does not have features I need',
  expensive: 'Too Expensive',
  switching: 'Switching to a different product'
}

const CancelPlanModal = ({ provider, cancelPlanDetails, handleSwitchModalOnCancel }) => {
  const [feedback, setFeedback] = useState('')
  const [currentStep, setCurrentStep] = useState('confirm')
  const [feedbackReasonSelection, setFeedbackReasonSelection] = useState<string[]>([])
  const organizationId = useOrganizationId()
  const [postSubscriptionRequest, postSubscriptionRequestResult] = usePostSubscriptionRequestMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  const submitRequest = async () => {
    await postSubscriptionRequest({
      organizationId,
      payload: {
        requestType: 'cancellation',
        requestDetails: {
          planName: cancelPlanDetails?.planName,
          billingCycle: cancelPlanDetails?.billingCycle,
          feedback,
          cancellationReasons: feedbackReasonSelection.map((reasonId) => REASONS_FOR_CANCELLATION[reasonId])
        }
      }
    })
  }

  const resetModal = () => {
    setCurrentStep('confirm')
    setFeedback('')
    setFeedbackReasonSelection([])
  }

  const onClickCheckbox = (feedbackReasonId) => {
    if (feedbackReasonSelection.includes(feedbackReasonId)) {
      setFeedbackReasonSelection(feedbackReasonSelection.filter((reasonId) => reasonId !== feedbackReasonId))
    } else {
      setFeedbackReasonSelection([...feedbackReasonSelection, feedbackReasonId])
    }
  }

  useEffect(() => {
    if (postSubscriptionRequestResult.isSuccess) {
      resetModal()
      handleSwitchModalOnCancel()
      triggerSendAnalysis({
        eventType: 'REQUEST_TO_CANCEL_PLAN',
        metadata: {
          requestType: 'cancel',
          organizationId,
          requestDetails: {
            planName: cancelPlanDetails?.planName,
            billingCycle: cancelPlanDetails?.billingCycle
          }
        }
      })
    } else if (postSubscriptionRequestResult.isError) {
      toast.error('There was an error submitting your details') // Todo: Check with Prateeksha on this one for copy
    }
  }, [postSubscriptionRequestResult.isSuccess, postSubscriptionRequestResult.isError])

  return (
    <BaseModal provider={provider} classNames="rounded-3xl" width="600">
      <BaseModal.Header extendedClass="items-center">
        <BaseModal.Header.HeaderIcon icon={warningBig} />
        <BaseModal.Header.Title>Cancel Plan</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton
          onClose={() => {
            triggerSendAnalysis({
              eventType: 'CLOSE_CANCEL_MODAL',
              metadata: {
                requestType: 'cancel',
                organizationId,
                requestDetails: {
                  planName: cancelPlanDetails?.planName,
                  billingCycle: cancelPlanDetails?.billingCycle
                }
              }
            })
            resetModal()
          }}
        />
      </BaseModal.Header>
      <hr className="mt-6" />
      <BaseModal.Body extendedClass="!p-8">
        {currentStep === 'confirm' && (
          <div className="h-[420px]">
            <Typography variant="heading3" classNames="mb-4">
              Are you sure you want to cancel your plan?
            </Typography>
            <Typography variant="body2" styleVariant="semibold" color="secondary">
              Your monthly subscription is valid until {cancelPlanDetails?.expiryDate}. You will no longer be able to
              access any feature after that date.
            </Typography>
            <div className="mt-8 bg-[#F9FAFB] rounded py-4 px-6">
              <Typography variant="subtitle1" classNames="mb-3">
                Facing issues or have questions?
              </Typography>
              <Typography variant="body2" classNames="mb-6">
                We can help you with any issues you might be facing.
              </Typography>
              <Button
                variant="whiteWithBlackBorder"
                onClick={() => window.open('https://ledgerx.com/contact', '_blank')}
                height={32}
                label="Contact Us"
              />
            </div>
            <div className="mt-8 bg-[#F9FAFB] rounded py-4 px-6">
              <Typography variant="subtitle1" classNames="mb-3">
                Current plan not working for you?
              </Typography>
              <Typography variant="body2" classNames="mb-6">
                Try another plan that suits your needs.
              </Typography>
              <Button
                variant="whiteWithBlackBorder"
                onClick={() => {
                  triggerSendAnalysis({
                    eventType: 'CHANGE_PLAN_IN_CANCEL_MODAL',
                    metadata: {
                      requestType: 'cancel',
                      organizationId,
                      requestDetails: {
                        planName: cancelPlanDetails?.planName,
                        billingCycle: cancelPlanDetails?.billingCycle
                      }
                    }
                  })
                  provider.methods.setIsOpen(false)
                }}
                height={32}
                label="Change Plan"
              />
            </div>
          </div>
        )}
        {currentStep === 'feedback' && (
          <div className="h-[420px] ">
            <div className="flex gap-4 items-center mb-4">
              <Image src={sadFaceBlack} width={24} height={24} />
              <Typography variant="heading3">We are sorry to see you go.</Typography>
            </div>
            <Typography variant="body2" styleVariant="semibold" color="secondary">
              Before you go, please tell us how we can improve.
            </Typography>
            <Typography variant="body2" styleVariant="semibold" classNames="mt-8">
              What did you like about LedgerX ?
            </Typography>
            <textarea // Question - Need to change to TextField component ? 🤔
              value={feedback}
              rows={4}
              style={{ resize: 'none' }}
              className="border rounded w-full mt-4 p-2 text-neutral-900 font-normal text-sm scrollbar leading-[18px]"
              onChange={(e) => {
                e.preventDefault()
                setFeedback(e.target.value)
              }}
            />
            <Typography variant="body2" styleVariant="semibold" classNames="mt-8">
              Why are you cancelling your plan ?
            </Typography>
            <div className="flex gap-2 mt-8">
              <input
                type="checkbox"
                name="cancellation reason"
                id="noFeatures"
                checked={feedbackReasonSelection.includes('noFeatures')}
                onChange={() => onClickCheckbox('noFeatures')}
                className={styles.checkbox}
              />
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label htmlFor="noFeatures" className="">
                <Typography variant="body2">Doesn&apos;t have features I need</Typography>
              </label>
            </div>
            <div className="flex gap-2 mt-8">
              <input
                type="checkbox"
                name="cancellation reason"
                id="expensive"
                checked={feedbackReasonSelection.includes('expensive')}
                onChange={() => onClickCheckbox('expensive')}
                className={styles.checkbox}
              />
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label htmlFor="expensive">
                <Typography variant="body2">Too Expensive</Typography>
              </label>
            </div>
            <div className="flex gap-2 mt-8">
              <input
                type="checkbox"
                name="cancellation reason"
                id="switching"
                checked={feedbackReasonSelection.includes('switching')}
                onChange={() => onClickCheckbox('switching')}
                className={styles.checkbox}
              />
              {/* eslint-disable jsx-a11y/label-has-associated-control */}
              <label htmlFor="switching">
                <Typography variant="body2">Switching to a new product</Typography>
              </label>
            </div>
          </div>
        )}
      </BaseModal.Body>
      <BaseModal.Footer>
        {currentStep === 'confirm' && (
          <>
            <BaseModal.Footer.SecondaryCTA
              label="Continue to Cancel"
              classNames="w-full"
              onClick={() => setCurrentStep('feedback')}
            />
            <BaseModal.Footer.PrimaryCTA
              label="Keep my Plan"
              onClick={() => {
                resetModal()
                provider.methods.setIsOpen(false)
                triggerSendAnalysis({
                  eventType: 'KEEP_PLAN_IN_CANCEL_MODAL',
                  metadata: {
                    requestType: 'cancel',
                    organizationId,
                    requestDetails: {
                      planName: cancelPlanDetails?.planName,
                      billingCycle: cancelPlanDetails?.billingCycle
                    }
                  }
                })
              }}
            />
          </>
        )}
        {currentStep === 'feedback' && (
          <>
            <BaseModal.Footer.SecondaryCTA
              label="Request to Cancel"
              classNames="w-full"
              disabled={feedback === '' && feedbackReasonSelection.length === 0}
              onClick={() => submitRequest()}
            />
            <BaseModal.Footer.PrimaryCTA
              label="Keep my Plan"
              onClick={() => {
                resetModal()
                provider.methods.setIsOpen(false)
              }}
            />
          </>
        )}
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default CancelPlanModal
