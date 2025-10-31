/* eslint-disable react/no-array-index-key */
import { IntegrationName } from '@/api-v2/organization-integrations'
import { CurrencyType } from '@/api-v2/payment-api'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { Alert } from '@/components-v2/molecules/Alert'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import LeftArrow from '@/public/svg/Dropdown.svg'
import { integrationSelector } from '@/slice/org-integration/org-integration-selector'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useAppSelector } from '@/state'
import ErrorBanner from '@/views/MakePayment2/components/ErrorBanner'
import AddNewRecipientModal from '@/views/Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import ContactTransactionModal from '@/views/_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { FormProvider } from 'react-hook-form'
import PaymentFooter from '../components/PaymentFooter/PaymentFooter'
import useCreateDrafts from '../hooks/useCreateDrafts'
import useDraftFormLogic, { errorMessageMap } from '../hooks/useDraftForm/useDraftFormLogic'
import useDraftLogic from '../hooks/useDraftLogic'
import FiatPaymentLineItem from './FiatPaymentLineItem'

const CreateFiatPayment = () => {
  const router = useRouter()
  const showBanner = useAppSelector(showBannerSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const subscription = useAppSelector(subscriptionPlanSelector)
  const integrations = useAppSelector(integrationSelector)

  const {
    methods,
    payee,
    reviewer,
    isDisabled,
    tagsHandler,
    uniqueValidationErrorFields,
    isLoadingWithLabelForReview,
    isLoadingWithLabelForSaveDraft,
    handleSubmitForReview,
    handleChangeReviewer,
    handleFormSubmit,
    handleCopyRecipientRow,
    handleFileChange,
    handleRemoveRecipient,
    handleChangeInput,
    handleAddRecipient,
    handleSelectContact,
    handleClickFooterSecondary,
    onChangeTextInput,
    onChangeChartOfAccount,
    onChangePurposeOfTransfer,
    onChangeToken
  } = useDraftFormLogic(CurrencyType.FIAT)

  const {
    organizationId,
    members,
    openAddRecipientModal,
    importContactModalProvider,
    walletToAddAsContact,
    setOpenAddRecipientModal,
    setErrorMsg,
    setStatus,
    handlePreviewFile,
    onAddContactSuccess,
    onClickAddNewContact
  } = useDraftLogic(methods)

  const { chartOfAccountsOptions, bankAccountOptions, currenciesOptions, purposeOfTransferOptions, loadingData } =
    useCreateDrafts()

  const handleCreateRecipient = () => {
    router.push(`/${organizationId}/contacts/create/individual`)
  }

  const isEnable = useMemo(
    () =>
      // subscription?.organizationIntegrationAddOns?.triple_a &&
      // integrations?.some((integration) => integration?.integrationName === IntegrationName.TRIPLE_A),
      subscription?.organizationIntegrationAddOns?.triple_a,
    [subscription]
  )

  return (
    <FormProvider {...methods}>
      <form>
        <Header>
          <div className="flex items-center">
            <Button
              variant="ghost"
              height={24}
              classNames="!h-[30px] p-[0.5rem]"
              leadingIcon={<Image src={LeftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
              onClick={() => router.push(`/${organizationId}/transact/drafts`)}
            />
            <Breadcrumb>
              <Link href={`/${organizationId}/transact/drafts`}>Drafts</Link>
              <Link href={`/${organizationId}/transact/drafts/create/crypto`}>Create Draft</Link>
            </Breadcrumb>
          </div>
        </Header>

        <View.Content className={`${showBanner ? '!h-[calc(100vh-326px)]' : 'h-[calc(100vh-256px)]'}`}>
          {!isEnable && (
            <div className="mb-3">
              <Alert variant="warning" isVisible>
                <Alert.Icon />
                <Alert.Text extendedClass="text-black-0 flex items-center justify-between">
                  You are required to upgrade your plan to unlock Crypto to Fiat payments.{' '}
                  <Button
                    label="Get Started"
                    variant="whiteWithBlackBorder"
                    onClick={() => {
                      router.push(`/${organizationId}/orgsettings?activeTab=pricingAndPlans`)
                    }}
                    height={32}
                  />
                </Alert.Text>
              </Alert>
            </div>
          )}
          <div className="w-full text-dashboard-main mt-1">
            <div className="flex flex-row justify-between items-center">
              <Typography variant="subtitle1">Payments</Typography>
            </div>
          </div>
          {uniqueValidationErrorFields.size > 0 && (
            <ErrorBanner classNames="mt-4">
              <Typography variant="body2" classNames="!text-[#C61616]">
                We have found some error(s) in the below payments. Please resolve them to proceed.
              </Typography>
              <ul className="pl-6">
                {Array.from(uniqueValidationErrorFields)
                  ?.filter((item) => errorMessageMap[`${item}`])
                  .map((recipientErrorField) => (
                    <li key={`fiat-${recipientErrorField}`} className="list-disc text-[#C61616]">
                      <Typography variant="body2" classNames="!text-[#C61616]">
                        {/* @ts-ignore */}
                        {`${errorMessageMap[recipientErrorField]}`}
                      </Typography>
                    </li>
                  ))}
              </ul>
            </ErrorBanner>
          )}
          <div className="w-full text-dashboard-main mt-5">
            {payee?.map((item, index) => (
              <FiatPaymentLineItem
                index={index}
                key={index}
                token={item?.token}
                files={item?.files}
                annotations={item?.annotations}
                amount={item?.amount}
                note={item?.note}
                removeDisabled={false}
                isLoading={loadingData}
                purposeOfTransferOptions={purposeOfTransferOptions}
                accountOptions={chartOfAccountsOptions}
                contactOptions={bankAccountOptions}
                tokenOptions={currenciesOptions}
                errors={methods?.formState.errors?.recipients?.[index]}
                onCopyItem={handleCopyRecipientRow}
                onRemoveItem={handleRemoveRecipient}
                onInputChange={handleChangeInput}
                onContactChange={handleSelectContact(index)}
                onTokenChange={onChangeToken(`recipients.${index}.token`)}
                onAmountChange={onChangeTextInput(`recipients.${index}.amount`)}
                onAccountChange={onChangeChartOfAccount}
                onPurposeTransferChange={onChangePurposeOfTransfer}
                onNoteChange={onChangeTextInput(`recipients.${index}.note`)}
                onFileChange={handleFileChange}
                account={item?.chartOfAccounts}
                purposeTransfer={item?.purposeOfTransfer}
                contact={item?.walletAddress}
                onSaveContact={onClickAddNewContact}
                onCreateRecipient={handleCreateRecipient}
                totalRecipients={payee?.length}
                tagsHandler={tagsHandler}
                onPreviewFile={handlePreviewFile}
              />
            ))}
            <div className="flex gap-4 pl-8 pt-2 items-center">
              <button
                type="button"
                onClick={handleAddRecipient}
                className="font-inter text-dashboard-main font-medium text-xs text-right px-3 py-[7px] border border-dashboard-border-200 rounded"
              >
                + Add another payment
              </button>
            </div>
          </div>
        </View.Content>

        <PaymentFooter
          members={members}
          reviewer={reviewer}
          isLoadingWithLabelForSaveDraft={isLoadingWithLabelForSaveDraft}
          isLoadingWithLabelForReview={isLoadingWithLabelForReview}
          isDisabled={isDisabled}
          handleClickFooterSecondary={handleClickFooterSecondary}
          handleFormSubmit={handleFormSubmit}
          handleChangeReviewer={handleChangeReviewer}
          handleSubmitForReview={handleSubmitForReview}
        />
      </form>

      {openAddRecipientModal && (
        <AddNewRecipientModal
          setError={setErrorMsg}
          setStatus={setStatus}
          showModal={openAddRecipientModal}
          setShowModal={setOpenAddRecipientModal}
          selectedChain={selectedChain}
        />
      )}

      <ContactTransactionModal
        showModal={importContactModalProvider?.state?.isOpen}
        setShowModal={importContactModalProvider?.methods?.setIsOpen}
        contactAddress={walletToAddAsContact.current?.address}
        onSuccess={onAddContactSuccess}
      />
    </FormProvider>
  )
}

export default CreateFiatPayment
