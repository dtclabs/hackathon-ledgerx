import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { selectUserOrganizations } from '@/slice/organization/organization.selectors'
import { useAppDispatch, useAppSelector } from '@/state'
import { setCurrentPage } from '@/state/global/actions'
import { useRouter } from 'next/router'
import { EProcessStatus } from './interface'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import CreateOrgInfoCard from './components/CreateOrgInfoCard'
import CreateOrgCard, { ICreateOrgForm } from './components/CreateOrgCard'
import { logEvent } from '@/utils/logEvent'
import LoadingOverlay from '@/components/InProcessToast/InProcessToast'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useLazyConnectOrgQuery, useCreateOrganizationMutation } from '@/slice/organization/organization.api'

const Organization = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [view, setView] = useState('create')
  const [triggerCreateOrganization, createOrganizationResponse] = useCreateOrganizationMutation()
  const [showError, setShowError] = useState(null)
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [triggerConnectOrganization] = useLazyConnectOrgQuery()

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
      triggerConnectOrganization({ organisationId: createOrganizationResponse?.data?.data?.publicId })
      router.push(`/${createOrganizationResponse?.data?.data?.publicId}/dashboard?welcome=true`)
    } else if (createOrganizationResponse.isError) {
      setShowError(createOrganizationResponse.error?.data?.message)
    }
  }, [createOrganizationResponse])

  const handleCloseErrorModal = () => {
    setShowError(null)
  }
  const handleRetry = () => {
    handleCloseErrorModal()
  }

  const handleProceedToLogin = () => {
    handleCloseErrorModal()
    dispatch({ type: 'reset/INITIAL_STATE' })
    router.push('/')
  }

  const handleOnClickCreateNow = () => setView('create')

  const handleOnClickBack = () => setView('display')

  const onClickCreateOrg = async (_data: ICreateOrgForm) => {
    _data.contacts = _data.contacts.filter((contact) => contact.content !== '')
    const contacts = {}

    _data.contacts.forEach((contact) => {
      if (contacts[contact.provider.toLowerCase()]) {
        contacts[contact.provider.toLowerCase()]++
      } else {
        contacts[contact.provider.toLowerCase()] = 1
      }
    })

    if (_data.contacts?.length > 0) {
      triggerCreateOrganization({
        name: _data?.name,
        type: _data?.type,
        contacts: _data.contacts,
        jobTitle: _data.role.value
      })
      triggerSendAnalysis({
        eventType: 'SIGN_UP',
        metadata: {
          action: 'step_3',
          jobTitle: _data.role.value,
          ...contacts
        }
      })
      logEvent({
        event: 'create_organisation_in_app',
        payload: {
          event_category: 'Full app',
          event_label: '',
          value: 1
        }
      })
    }
  }

  return (
    <div>
      <Header newLogo />
      <div className="bg-white w-full h-homeView flex items-center justify-center font-inter p-8 pt-0">
        {view === 'display' && <CreateOrgInfoCard onClickCreateNow={handleOnClickCreateNow} />}
        {view === 'create' && (
          <CreateOrgCard
            onClickBack={handleOnClickBack}
            onClickSubmit={onClickCreateOrg}
            height="h-full"
            className="m-0 p-0 overflow-auto scrollbar py-[46px]"
            btnClassName="pb-[46px]"
          />
        )}
      </div>
      {createOrganizationResponse?.isLoading && <LoadingOverlay title="Loading" />}

      {/* Notification Modal */}
      {showError === 'jwt expired' ? (
        <NotificationPopUp
          type="error"
          acceptText="Proceed to login"
          // declineText="Close"
          onModalClose={handleProceedToLogin}
          description="Your login session has expired. Please log in again to continue."
          onClose={handleProceedToLogin}
          showModal={showError}
          setShowModal={setShowError}
          title="Session Expired"
          onAccept={handleProceedToLogin}
        />
      ) : (
        <NotificationPopUp
          type="error"
          acceptText="Retry"
          option
          declineText="Close"
          onModalClose={handleCloseErrorModal}
          description={showError}
          onClose={handleCloseErrorModal}
          showModal={showError}
          setShowModal={setShowError}
          title="Error"
          onAccept={handleRetry}
        />
      )}
    </div>
  )
}

export default Organization
