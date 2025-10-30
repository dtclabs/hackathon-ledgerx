/* eslint-disable react/no-array-index-key */
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { PaymentLineItemV2 } from '@/components-v2/molecules/PaymentLineItemV2'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import LeftArrow from '@/public/svg/Dropdown.svg'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import ErrorBanner from '@/views/MakePayment2/components/ErrorBanner'
import AddNewRecipientModal from '@/views/Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import ContactTransactionModal from '@/views/_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import { ImportRecipientsModal } from '../components/ImportRecipientsModal'
import PaymentFooter from '../components/PaymentFooter/PaymentFooter'
import useCreateDrafts from '../hooks/useCreateDrafts'
import useDraftFormLogic, { errorMessageMap } from '../hooks/useDraftForm/useDraftFormLogic'
import useDraftLogic from '../hooks/useDraftLogic'
import { CurrencyType } from '@/api-v2/payment-api'

const CreateCryptoPayment = () => {
  const router = useRouter()
  const showBanner = useAppSelector(showBannerSelector)
  const selectedChain = useAppSelector(selectedChainSelector)

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
    onChangeToken
  } = useDraftFormLogic(CurrencyType.CRYPTO)

  const {
    organizationId,
    members,
    uploadCsvModalProvider,
    openAddRecipientModal,
    importContactModalProvider,
    walletToAddAsContact,
    setOpenAddRecipientModal,
    setErrorMsg,
    setStatus,
    handlePreviewFile,
    handleOnClickUploadCSV,
    handleCreateRecipient,
    onAddContactSuccess,
    onClickAddNewContact
  } = useDraftLogic(methods)

  const { chartOfAccountsOptions, contactOptions, tokenOptions } = useCreateDrafts()

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
          <div className="w-full text-dashboard-main mt-1">
            <div className="flex flex-row justify-between items-center">
              <Typography variant="subtitle1">Payments</Typography>
              <div className="flex">
                <Button variant="grey" height={40} onClick={handleOnClickUploadCSV} label="+ Add from CSV" />
              </div>
            </div>
          </div>
          {uniqueValidationErrorFields.size > 0 && (
            <ErrorBanner classNames="mt-4">
              <Typography variant="body2" classNames="!text-[#C61616]">
                We have found some error(s) in the below payments. Please resolve them to proceed.
              </Typography>
              <ul className="pl-6">
                {Array.from(uniqueValidationErrorFields).map((recipientErrorField) => (
                  <li key={`crypto-${recipientErrorField}`} className="list-disc text-[#C61616]">
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
              <PaymentLineItemV2
                index={index}
                key={index}
                token={item?.token}
                files={item?.files}
                annotations={item?.annotations}
                amount={item?.amount}
                note={item?.note}
                removeDisabled={false}
                accountOptions={chartOfAccountsOptions}
                contactOptions={contactOptions}
                tokenOptions={tokenOptions}
                errors={methods?.formState.errors?.recipients?.[index]}
                onCopyItem={handleCopyRecipientRow}
                onRemoveItem={handleRemoveRecipient}
                onInputChange={handleChangeInput}
                onContactChange={handleSelectContact(index)}
                onTokenChange={onChangeToken(`recipients.${index}.token`)}
                onAmountChange={onChangeTextInput(`recipients.${index}.amount`)}
                onAccountChange={onChangeChartOfAccount}
                onNoteChange={onChangeTextInput(`recipients.${index}.note`)}
                onFileChange={handleFileChange}
                account={item?.chartOfAccounts}
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

      <ImportRecipientsModal provider={uploadCsvModalProvider} currencyType={CurrencyType.CRYPTO} />

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

export default CreateCryptoPayment
