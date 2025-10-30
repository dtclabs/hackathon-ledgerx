import TransactionActionButtons from '../../TransactionActionButtons'

const DisplayActions = (params) => {
  const {
    data,
    onClickExecuteRejection,
    onClickExecuteTransaction,
    onClickApproveTransaction,
    onClickRejectTransaction,
    isLoading,
    permissionMap
  } = params

  return (
    <div className="h-full flex  items-center">
      <TransactionActionButtons
        id={data?.id}
        transaction={data}
        isDisabled={isLoading}
        permissonMap={permissionMap}
        onClickExecuteRejection={onClickExecuteRejection}
        onClickExecuteTransaction={onClickExecuteTransaction}
        onClickApproveTransaction={onClickApproveTransaction}
        onClickRejectTransaction={onClickRejectTransaction}
      />
    </div>
  )
}
export default DisplayActions
