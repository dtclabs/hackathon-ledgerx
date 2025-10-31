/* eslint-disable no-promise-executor-return */
/* eslint-disable no-param-reassign */
import { format } from 'date-fns'
import { useEffect, useState, useRef } from 'react'
import { useAppSelector } from '@/state'
import { useWeb3React } from '@web3-react/core'
import { useTransaction } from '@/hooks/useTransactionLegacy'
import { useOrganizationId } from '@/utils/getOrganizationId'
import useSafeService from '@/hooks-v2/useSafeService'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import {
  checkIsTransactionRejected,
  checkIsConnectedAccountSafeOwner,
  parseTransactionFiatAndCryptoData,
  checkTransactionExecutedByConnectedAccount
} from './utils'
import { IParsedQueuedTransaction } from './interface'
import { toast } from 'react-toastify'
import Modal from '@/components/Modal'
import SelectSafe from './components/SelectSafe'
import Loader from '@/components/Loader/Loader'
import { SideModal } from '@/components-v2/SideModal'
import Typography from '@/components-v2/atoms/Typography'
import PendingSection from './components/PendingSection'
import ExectuteSection from './components/ExectuteSection'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import TransactionRejectModal from './components/TransactionRejectModal'
import { TransactionDetail } from './components/TransactionDetailSideModal'
import ConnectWalletButton from '@/components-v2/molecules/ConnectWalletButton'
import NotificationSending from '@/components/NotificationSending/NotificationSending'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { selectWalletByChainAndType } from '@/slice/wallets/wallet-selectors'
import {
  useGetPendingTransactionsNewQuery,
  useLazyGetPendingTransactionsNewQuery
} from '@/slice/pending-transactions/pending-transactions.api'
import ContactTransactionModal from '../Transactions/components/ContactTransaction/ContactTransaction'
import { usePostAnalysisForPayoutMutation } from '@/api-v2/analysis-api'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { log } from '@/utils-v2/logger'
import DisconnectWalletChip from '@/components-v2/molecules/DisconnectWalletChip'
import ChainSelectorDropdownV2 from '@/components-v2/molecules/ChainSelectorDropdownV2'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const Transactions: React.FC = () => {
  const tempSelectedTransaction = useRef(null)
  const walletToAddAsContact = useRef(null)
  const [executableTransactions, setExecutableTransactions] = useState([])
  const [queuedTransactions, setQueuedTransactions] = useState([])

  const [isInitalized, setIsInitialized] = useState(false)
  const importContactModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const rejectTransactionModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const [isParsingTransactionOwnership, setIsParsingTransactionOwnership] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [selectedSafe, setSelectedSafe] = useState(null)

  const { account } = useWeb3React()
  const organizationId = useOrganizationId()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const organizationSettings = useAppSelector(orgSettingsSelector)

  const safeServiceClient = useSafeService({
    initialRpcUrl: account && selectedChain?.rpcUrl,
    initialSafeUrl: account && selectedChain?.safeUrl
  })
  const walletsByChainAndType = useAppSelector((state) =>
    selectWalletByChainAndType(state, 'gnosis', account && selectedChain?.id ? selectedChain?.id : null)
  )

  const [postPayoutAnalysis] = usePostAnalysisForPayoutMutation()
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()

  const {
    executeLoading,
    confirmLoading: isAwaitingWalletConfirmation,
    nonExecuteLoading,
    setShowError,
    showError,
    error: errorMessage,
    handleSign,
    handleReject,
    handleExecuted
  } = useTransaction()

  const parsedChainData = supportedChains?.map((chain) => ({
    value: chain.chainId,
    label: chain.name,
    imageUrl: chain.imageUrl,
    rpcUrl: chain.rpcUrl,
    safeUrl: chain.safeUrl,
    symbol: chain.symbol
  }))

  useEffect(() => {
    setTimeout(() => {
      setIsInitialized(true)
    }, 1500)
  }, [])

  useEffect(() => {
    if (account && selectedChain?.id) {
      safeServiceClient.updateUrls(selectedChain?.rpcUrl, selectedChain?.safeUrl)
    }
  }, [account, selectedChain?.id])

  useEffect(() => {
    if (showError) {
      if (errorMessage?.includes('code=ACTION_REJECTED') || errorMessage?.includes('User rejected transaction')) {
        toast.error('User has rejected signing the transaction')
      } else {
        toast.error(errorMessage)
      }
    }
    setShowError(false)
  }, [showError])

  const { data } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  // const {
  //   // data: pendingTransactions,
  //   isLoading: isLoadingPendingTransaction,
  //   isFetching: isFetchingPendingTransaction,
  //   isUninitialized: isUninitializedPendingTransaction
  //   // refetch: refetchPendingTransactions
  // } = useGetPendingTransactionsNewQuery(
  //   {
  //     organizationId,
  //     params: {
  //       blockchainIds: account ? [selectedChain?.id] : [],
  //       walletIds: selectedSafe?.id ? [selectedSafe?.id] : []
  //     }
  //   },
  //   { skip: !organizationId || !isInitalized }
  // )

  const [triggerGetPendingTx, getPendingTxResponse] = useLazyGetPendingTransactionsNewQuery()
  const { isLoading: isLoadingPendingTransaction, isFetching: isFetchingPendingTransaction } = getPendingTxResponse

  useEffect(() => {
    batchParseIncomingData()
  }, [account, selectedChain?.id])

  const batchParseIncomingData = async (safeId?: any) => {
    const uniqueSafeAddresses = new Set<string>()
    const transactionsToExecute = new Map()
    const allTransactions = []

    const result = await triggerGetPendingTx({
      organizationId,
      params: {
        blockchainIds: account ? [selectedChain?.id] : [],
        walletIds: safeId ? [safeId] : selectedSafe?.id ? [selectedSafe?.id] : []
      }
    }).unwrap()
    console.log('RESULT: ', result)

    const pendingTransactions = result?.data
    try {
      // Phase 1 - Initial to get lowest nonce for each safe
      pendingTransactions?.forEach((transaction: any) => {
        if (transaction.wallet && transaction.wallet.address) {
          uniqueSafeAddresses.add(transaction.wallet.address)
          // Find the transaction with the highest nonce for each safe
          // Push it to the transactionsToExecute map & Add isReady flag to the transaction
          if (
            !transactionsToExecute.has(transaction.wallet.address) ||
            transaction.nonce < transactionsToExecute.get(transaction.wallet.address).nonce
          ) {
            transactionsToExecute.set(transaction.wallet.address, {
              ...transaction,
              isQueued: false,
              isTransactionExecutable: transaction?.confirmationsRequired === transaction?.confirmations?.length,
              isRejected: checkIsTransactionRejected(transaction) // Low cost check
            })
          } else {
            // Collect all transactions & Add isReady flag to the transaction
            allTransactions.push({
              ...transaction,
              isQueued: true,
              isTransactionExecutable: transaction?.confirmationsRequired === transaction?.confirmations?.length,
              isRejected: checkIsTransactionRejected(transaction) // Low cost check
            })
          }
        }
      })

      // Convert Set of unique safe addresses to array
      const safeAddresses = Array.from(uniqueSafeAddresses)
      const readyTransactions = Array.from(transactionsToExecute.values())
      const readyTransactionsIds = readyTransactions.map((transaction) => transaction.id)
      // Filter out the 'ready' transactions and sort the remaining by nonce
      const remainingTransactions = allTransactions
        .filter((transaction) => !readyTransactionsIds.includes(transaction?.id))
        .sort((a, b) => a.nonce - b.nonce)

      const { updatedReadyTransactions, updatedRemainingTransactions } = await parseTransactionFiatAndCrypto({
        readyTransactions,
        remainingTransactions
      })

      setExecutableTransactions(updatedReadyTransactions)
      setQueuedTransactions(updatedRemainingTransactions)
      // Start Phase 2
      parseTransactionOwnership({
        safeAddresses,
        readyTransactions: updatedReadyTransactions,
        remainingTransactions: updatedRemainingTransactions
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const parseTransactionOwnership = async ({ safeAddresses, readyTransactions, remainingTransactions }) => {
    // Phase 2 - Process checking current connected wallet ownership
    setIsParsingTransactionOwnership(true)
    const SOURCE_SAFE_OWNERS = {}

    if (safeAddresses.length !== 0) {
      for (const safeAddress of safeAddresses) {
        try {
          const safeInfo = await safeServiceClient.getSafeInfo({ address: safeAddress })
          if (safeInfo) {
            SOURCE_SAFE_OWNERS[safeAddress] = safeInfo.owners?.map((_ownerAddress) => _ownerAddress.toLowerCase())
          }
        } catch (err) {
          SOURCE_SAFE_OWNERS[safeAddress] = []
        }
      }
    }

    const updatedReadyTransactions = readyTransactions.map((transaction) => {
      const currentSafeOwners = SOURCE_SAFE_OWNERS[transaction?.wallet?.address] ?? []
      return {
        ...transaction,
        isExecutedByConnectedAccount: checkTransactionExecutedByConnectedAccount({
          confirmations: transaction?.confirmations ?? [],
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        }),
        isConnectedAccountOwner: checkIsConnectedAccountSafeOwner({
          safeOwners: currentSafeOwners,
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        })
      }
    })

    const updatedRemainingTransactions = remainingTransactions.map((transaction) => {
      const currentSafeOwners = SOURCE_SAFE_OWNERS[transaction?.wallet?.address] ?? []
      return {
        ...transaction,
        isExecutedByConnectedAccount: checkTransactionExecutedByConnectedAccount({
          confirmations: transaction?.confirmations ?? [],
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        }),
        isConnectedAccountOwner: checkIsConnectedAccountSafeOwner({
          safeOwners: currentSafeOwners,
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        })
      }
    })

    if (account && selectedChain?.id) {
      setExecutableTransactions(
        updatedReadyTransactions.filter(
          (transaction) => transaction?.blockchainId.toLowerCase() === selectedChain?.id.toLowerCase()
        )
      )
      setQueuedTransactions(
        updatedRemainingTransactions.filter(
          (transaction) => transaction?.blockchainId.toLowerCase() === selectedChain?.id.toLowerCase()
        )
      )
    } else {
      setExecutableTransactions(updatedReadyTransactions)
      setQueuedTransactions(updatedRemainingTransactions)
    }

    if (selectedTransaction) {
      const updatedSelectedTransaction = {
        ...selectedTransaction,
        isFinishedParsingData: true,
        isExecutedByConnectedAccount: checkTransactionExecutedByConnectedAccount({
          confirmations: selectedTransaction?.confirmations ?? [],
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        }),
        isConnectedAccountOwner: checkIsConnectedAccountSafeOwner({
          safeOwners: SOURCE_SAFE_OWNERS[selectedTransaction?.wallet?.address] ?? [],
          connectedAccount: account?.toLocaleLowerCase() ?? ''
        })
      }
      setSelectedTransaction(updatedSelectedTransaction)
    }
    setIsParsingTransactionOwnership(false)
  }

  const parseTransactionFiatAndCrypto = async ({ readyTransactions, remainingTransactions }) => {
    const updatedReadyTransactions = readyTransactions.map((transaction) => ({
      ...transaction,
      isFinishedParsingData: true,
      ...parseTransactionFiatAndCryptoData({ transaction, organizationSettings })
    }))

    const updatedRemainingTransactions = remainingTransactions.map((transaction) => ({
      ...transaction,
      isFinishedParsingData: true,
      ...parseTransactionFiatAndCryptoData({ transaction, organizationSettings })
    }))

    return {
      updatedReadyTransactions,
      updatedRemainingTransactions
    }
  }

  const handleOnClickTransactionRow = (transaction) => {
    setSelectedTransaction(transaction?.original)
  }

  // Handle Safe Actions

  const handleOnClickRejectTransaction = (_transaction) => {
    // This is to handle a user rejecting a proposed transaction
    tempSelectedTransaction.current = _transaction
    setSelectedTransaction(null)
    rejectTransactionModalProvider.methods.setIsOpen(true)
  }

  const handleOnClickExecuteRejectTransaction = async (_transaction, e) => {
    // Maybe check this again at runtime
    if (_transaction?.isConnectedAccountOwner) {
      handleExecuted({
        e,
        transaction: _transaction,
        sourceId: _transaction?.wallet?.id,
        callback: async () => {
          if (selectedTransaction) {
            tempSelectedTransaction.current = null
            setSelectedTransaction(null)
          }

          await sleep(1500)
          setIsParsingTransactionOwnership(true)
          toast.success('Transaction rejected successfully')
          batchParseIncomingData()
        }
      })
    } else {
      toast.error('You are not the owner of this safe')
    }
  }

  const handleOnClickApproveTransaction = async (_transaction, e) => {
    // Maybe check this again at runtime
    if (_transaction?.isConnectedAccountOwner) {
      handleSign(_transaction, _transaction.wallet?.id, e, async () => {
        if (selectedTransaction) {
          tempSelectedTransaction.current = null
          setSelectedTransaction(null)
        }

        await sleep(1500)
        setIsParsingTransactionOwnership(true)
        batchParseIncomingData()

        toast.success('Transaction approved successfully')
      })
    } else {
      toast.error('You are not the owner of this safe')
    }
  }

  const handleOnClickExecuteTransaction = async (_transaction, e) => {
    handleExecuted({
      e,
      transaction: _transaction,
      sourceId: _transaction?.wallet?.id,
      callback: async (txHash) => {
        // ------------------- Calculate Total USD amount --------------
        const cryptocurrencies = _transaction.recipients.map((recipient) => recipient.cryptocurrency)
        const cryptoCurrencyPriceMap = {}
        try {
          await Promise.all(
            cryptocurrencies.map(async (cryptocurrency) => {
              const price = await triggerGetPrice({
                params: {
                  cryptocurrencyId: cryptocurrency.publicId,
                  fiatCurrency: 'USD',
                  date: new Date().toISOString()
                }
              })

              cryptoCurrencyPriceMap[cryptocurrency.publicId] = price?.data?.data
            })
          )
        } catch (err) {
          log.error(
            'Error while fetching token price from prices API - Pending Approval page',
            ['Error while fetching token price from prices API - Pending Approval page'],
            { actualErrorObject: err && JSON.stringify(err) },
            `${window.location.pathname}`
          )
        }

        // Find payment total based on all line items
        const paymentTotal = await _transaction?.recipients.reduce((acc, user) => {
          const token = user?.cryptocurrency.publicId
          const tokenAmount = parseFloat(user?.cryptocurrencyAmount)
          const tokenPrice = cryptoCurrencyPriceMap[token]
          const userValue = tokenAmount * tokenPrice
          // Add to total value
          acc += userValue
          return acc
        }, 0)
        postPayoutAnalysis({
          blockchainId: selectedChain?.id,
          type: 'safe',
          sourceType: 'gnosis_safe',
          sourceAddress: _transaction?.wallet?.address,
          sourceWalletId: _transaction?.wallet?.id,
          hash: txHash,
          applicationName: 'full_app',
          totalLineItems: _transaction?.recipients?.length,
          notes: _transaction?.notes,
          lineItems: _transaction?.recipients?.map((recipient) => ({
            address: recipient?.address,
            cryptocurrencyId: recipient?.cryptocurrency?.publicId,
            amount: recipient?.cryptocurrencyAmount,
            chartOfAccountId: recipient?.chartOfAccount?.id,
            notes: recipient?.notes,
            files: recipient?.files
          })),
          totalAmount: paymentTotal?.toFixed(2),
          valueAt: new Date().toISOString()
        })
        if (selectedTransaction) {
          tempSelectedTransaction.current = null
          setSelectedTransaction(null)
        }
        await sleep(1500)
        setIsParsingTransactionOwnership(true)
        toast.success('Transaction executed successfully')
        batchParseIncomingData()
      }
    })
  }

  const handleRejectTransaction = async (_e) => {
    handleReject(tempSelectedTransaction.current, tempSelectedTransaction.current?.wallet?.id, _e, async () => {
      tempSelectedTransaction.current = null
      setSelectedTransaction(null)
      rejectTransactionModalProvider.methods.setIsOpen(false)
      toast.success('Transaction rejected successfully')
      await sleep(1500)
      setIsParsingTransactionOwnership(true)
      batchParseIncomingData()
    })
  }

  const handleAddContact = (_address: string) => {
    walletToAddAsContact.current = _address
    importContactModalProvider?.methods?.setIsOpen(true)
  }

  // Reflect contact data after adding successfully
  const handleAddContactSuccess = (_contact) => {
    const updatedContact = {
      name: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName
    }

    const updatedRecipients = selectedTransaction?.recipients?.map((recipient) => ({
      ...recipient,
      contact: recipient.address === walletToAddAsContact.current ? updatedContact : recipient.contact
    }))
    const updatedConfirmations = selectedTransaction?.confirmations?.map((confirmation) => ({
      ...confirmation,
      ownerContact: confirmation.owner === walletToAddAsContact.current ? updatedContact : confirmation.ownerContact
    }))

    setSelectedTransaction((prev) => ({
      ...prev,
      recipients: [...updatedRecipients],
      confirmations: [...updatedConfirmations]
    }))
  }

  const handleOnSelectSafe = (_safe) => {
    console.log('saafe', _safe)
    setSelectedSafe(_safe)
    batchParseIncomingData(_safe?.id)
  }

  return (
    <>
      <Header>
        <Header.Left.Title>
          Queue {getPendingTxResponse?.data?.data?.length > 0 ? `(${getPendingTxResponse?.data?.data?.length})` : '(0)'}
        </Header.Left.Title>
        <Header.Right>
          <div>
            {!account && (
              <div className="flex flex-row items-center gap-4 ">
                <Typography variant="body2" color="primary">
                  Please connect your wallet to approve transactions
                </Typography>
                <ConnectWalletButton />
              </div>
            )}
            {account && (
              <div className="flex gap-3 items-center">
                <ChainSelectorDropdownV2 supportedChainsFormatted={parsedChainData} />
                <DisconnectWalletChip />
              </div>
            )}
          </div>
        </Header.Right>
      </Header>
      <View.Content>
        <div>
          <section id="select-safe-section" className="mb-5">
            <Typography variant="subtitle1" color="primary" classNames="mb-3">
              Safe
            </Typography>
            <SelectSafe
              data={walletsByChainAndType}
              selectedChain={selectedChain}
              isLoading={isLoadingPendingTransaction || isInitalized === false || isFetchingPendingTransaction}
              selectedSafe={selectedSafe}
              onSelectSafe={handleOnSelectSafe}
            />
          </section>
          <section id="execute-section">
            <ExectuteSection
              isParsingTransactionOwnership={isParsingTransactionOwnership}
              onClickRejectTransaction={handleOnClickRejectTransaction}
              onClickExecuteTransaction={handleOnClickExecuteTransaction}
              onClickApproveTransaction={handleOnClickApproveTransaction}
              onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
              isLoading={isLoadingPendingTransaction || isInitalized === false || isFetchingPendingTransaction}
              onClickRow={handleOnClickTransactionRow}
              data={executableTransactions}
            />
          </section>
          <section className="mt-6" id="pending-section">
            <PendingSection
              isParsingTransactionOwnership={isParsingTransactionOwnership}
              onClickExecuteTransaction={handleOnClickExecuteTransaction}
              onClickApproveTransaction={handleOnClickApproveTransaction}
              onClickRejectTransaction={handleOnClickRejectTransaction}
              onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
              isLoading={isLoadingPendingTransaction || isInitalized === false || isFetchingPendingTransaction}
              onClickRow={handleOnClickTransactionRow}
              data={queuedTransactions}
            />
          </section>
        </div>
      </View.Content>
      <SideModal
        renderActionButtons={false}
        title={
          Boolean(selectedTransaction) && (
            <div className="flex flex-row items-center gap-2">
              {!selectedTransaction?.isRejected && (
                <>
                  <Typography variant="heading2">
                    {selectedTransaction?.recipients?.length ?? 0} Recipient
                    {selectedTransaction?.recipients?.length > 1 ? 's' : ''}
                  </Typography>
                  <DividerVertical height="h-4" />
                </>
              )}
              <Typography variant="caption" color="secondary">
                Transfer submitted on {format(new Date(selectedTransaction?.submissionDate), 'dd MMM yyyy')}
              </Typography>
            </div>
          )
        }
        modalWidth="w-[900px]"
        titleClassName="border-b-0"
        showModal={Boolean(selectedTransaction)}
        setShowModal={setSelectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        disableOutside={importContactModalProvider?.state?.isOpen}
      >
        <TransactionDetail
          isOpen={Boolean(selectedTransaction)}
          isParsingTransactionOwnership={isParsingTransactionOwnership}
          onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
          onClickRejectTransaction={handleOnClickRejectTransaction}
          onClickApproveTransaction={handleOnClickApproveTransaction}
          onClickExecuteTransaction={handleOnClickExecuteTransaction}
          onAddContact={handleAddContact}
          transaction={selectedTransaction}
        />
      </SideModal>
      <TransactionRejectModal
        isLoading={isAwaitingWalletConfirmation}
        onClickConfirm={handleRejectTransaction}
        provider={rejectTransactionModalProvider}
      />
      <ContactTransactionModal
        showModal={importContactModalProvider?.state?.isOpen}
        setShowModal={importContactModalProvider?.methods?.setIsOpen}
        contactAddress={walletToAddAsContact.current}
        onSuccess={handleAddContactSuccess}
      />
      {executeLoading && (
        <NotificationSending
          showModal={executeLoading}
          title="Sending transfer."
          subTitle="Please wait until the transfer is completed."
        />
      )}
      {nonExecuteLoading && (
        <Modal showModal zIndex="z-30">
          <Loader title="Waiting for wallet signature" />
        </Modal>
      )}
    </>
  )
}

export default Transactions
