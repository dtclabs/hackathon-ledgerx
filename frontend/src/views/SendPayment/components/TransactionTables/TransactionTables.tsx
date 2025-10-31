/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import { useWeb3React } from '@web3-react/core'
import TransactionQueue from './TransactionQueue/TransactionQueue'
import TransactionHistory from './TransactionHistory/TransactionHistory'
import TabItem from '../FreeTabsComponent/TabItem'
import Modal from '@/components/Modal'
import ErrorPopUp from '@/components/PopUp/ErrorPopUp/ErrorPopUp'
import { ITransactionTables, transactionTabs } from './interface'
import TransactionDetail from '../TransactionDetail/TransactionDetail'
import Tabs from '../FreeTabsComponent/Tabs'
import MetamaskTransactionDetail from '../TransactionDetail/MetamaskTransactionDetail'
import { useRecentlyHash } from '@/hooks/useRecentlyHash'

const TransactionTables: React.FC<ITransactionTables> = ({
  balances,
  showTransaction,
  totalTransactions,
  active,
  organization,
  showError,
  error,
  sourceAddress,
  source,
  expandList,
  transactionDetail,
  refreshLoading,
  currentTableData,
  totalCount,
  page,
  list,
  sourceList,
  currentTableDataHistory,
  showTransactionMetaMask,
  totalCountHistory,
  expandListHistory,
  metamaskHistory,
  setMetamaskTransactions,
  executedTran,
  price,
  availableSourceList,
  onReject,
  setActive,
  setShowTransaction,
  toggleExpandTransaction,
  setError,
  onShowImportModal,
  onShowTransaction,
  onSign,
  onRefresh,
  onExecuted,
  setPage,
  setShowError,
  setShowTransactionMetaMask,
  onShowTransactionMetaMask,
  setConnectError
}) => {
  const { recentlyTransactions } = useRecentlyHash()
  const { account } = useWeb3React()

  return (
    <>
      <Tabs
        tabsWrapperClass="h-[105px]"
        setActive={setActive}
        active={active}
        callback={onRefresh}
        organization={organization}
        endButton={
          sourceList &&
          !(sourceAddress === sourceList[0] && active === transactionTabs[1].key) && (
            <button
              className={`bg-grey-900 rounded-lg w-10 h-10 flex justify-center items-center hover:bg-grey-901 ${
                account ? '' : 'opacity-60'
              }`}
              type="button"
              onClick={() => {
                onRefresh()
              }}
              disabled={!account}
            >
              <img
                src="/image/refresh.png"
                alt="refresh"
                className={`w-8 h-auto ${refreshLoading ? 'animate-spin' : ''}`}
              />
            </button>
          )
        }
        tabs={
          availableSourceList && availableSourceList.length
            ? transactionTabs.map((item) => ({
                ...item,
                count:
                  (sourceList &&
                    sourceAddress === sourceList[0] &&
                    ((item.key === transactionTabs[1].key && 0) ||
                      (item.key === transactionTabs[0].key &&
                        (metamaskHistory.length >= 20 ? 20 : recentlyTransactions.length + metamaskHistory.length)))) ||
                  (item.key === transactionTabs[1].key && totalCount) ||
                  (item.key === transactionTabs[0].key &&
                    (executedTran && currentTableDataHistory.find((data) => data.safeTxHash === executedTran.safeTxHash)
                      ? totalCountHistory + 1
                      : totalCountHistory))
              }))
            : [transactionTabs[0]].map((item) => ({
                ...item,
                count: metamaskHistory.length >= 20 ? 20 : recentlyTransactions.length + metamaskHistory.length
              }))
        }
      >
        <TabItem key={transactionTabs[0].key}>
          <TransactionHistory
            account={account}
            price={price}
            totalCountHistory={totalCountHistory}
            totalCount={totalCount}
            sourceList={sourceList}
            sourceAddress={sourceAddress}
            currentTableData={currentTableData}
            expandList={expandList}
            page={page}
            currentTableDataHistory={currentTableDataHistory}
            expandListHistory={expandListHistory}
            metamaskHistory={metamaskHistory}
            setMetamaskTransactions={setMetamaskTransactions}
            onShowTransaction={onShowTransaction}
            onShowTransactionMetaMask={onShowTransactionMetaMask}
            setPage={setPage}
            setError={setError}
            setShowError={setShowError}
            toggleExpandTransaction={toggleExpandTransaction}
            executedTran={executedTran}
            setConnectError={setConnectError}
          />
        </TabItem>

        {availableSourceList && availableSourceList.length ? (
          <TabItem key={transactionTabs[1].key}>
            <TransactionQueue
              price={price}
              totalCount={totalCount}
              sourceList={sourceList}
              sourceAddress={sourceAddress}
              currentTableData={currentTableData}
              expandList={expandList}
              list={list}
              page={page}
              totalTransactions={totalTransactions}
              balances={balances && balances}
              source={source}
              onReject={onReject}
              onExecuted={onExecuted}
              onShowTransaction={onShowTransaction}
              onSign={onSign}
              onShowImportModal={onShowImportModal}
              setPage={setPage}
              setError={setError}
              setShowError={setShowError}
              toggleExpandTransaction={toggleExpandTransaction}
            />
          </TabItem>
        ) : (
          <></>
        )}
      </Tabs>
      {transactionDetail && (
        <>
          <TransactionDetail
            price={price}
            setShowModal={setShowTransaction}
            showModal={showTransaction}
            source={source}
            transaction={transactionDetail}
          />
          <MetamaskTransactionDetail
            setShowModalMetaMask={setShowTransactionMetaMask}
            showModalMetaMask={showTransactionMetaMask}
            transaction={transactionDetail}
          />
        </>
      )}
      {showError && (
        <Modal showModal={showError} setShowModal={setShowError}>
          <ErrorPopUp
            description={
              (error.includes('GS013') && 'This transaction failed. Please reject it on Gnosis App') || error
            }
            title="WARNING"
            action={() => {
              setError('')
              setShowError(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}

export default TransactionTables
