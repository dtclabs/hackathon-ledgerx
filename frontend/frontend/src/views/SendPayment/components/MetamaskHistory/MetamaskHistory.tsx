/* eslint-disable react/no-array-index-key */
import React from 'react'
import { useWeb3React } from '@web3-react/core'
import MetamaskTransactionTab from '../TransactionTables/TransactionTab/MetamaskTransactionTab'
import { IMetamaskHistory } from './interface'
import MetaMaskHistoryPending from './MetaMaskHistoryPending'
import { useRecentlyHash } from '@/hooks/useRecentlyHash'
import { logEvent } from '@/utils/logEvent'
// import useAuth from '@/hooks/useAuth'
// import { ConnectorNames } from '@/utils/web3React'

const MetamaskHistory: React.FC<IMetamaskHistory> = ({
  onShowTransactionMetaMask,
  sourceAddress,
  price,
  metamaskHistory,
  setMetamaskTransactions,
  setConnectError
}) => {
  const { account } = useWeb3React()
  // const { login } = useAuth()
  const { recentlyTransactions } = useRecentlyHash()
  const pendingTransactions = recentlyTransactions.filter((item) => !item.isExecuted)
  const toggleExpandTransaction = (hash: string) => {
    setMetamaskTransactions((prev) =>
      prev.map((item) => ({ ...item, isExpanded: item.hash === hash ? !item.isExpanded : item.isExpanded }))
    )
  }

  return (
    <div className="overflow-x-auto font-inter  relative">
      <MetaMaskHistoryPending sourceAddress={sourceAddress} price={price} />
      {sourceAddress === account && metamaskHistory && metamaskHistory.length > 0
        ? metamaskHistory.slice(0, metamaskHistory.length - pendingTransactions.length).map((item, index) => (
            <MetamaskTransactionTab
              price={price}
              onShowTransactionMetaMask={onShowTransactionMetaMask}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              item={item}
              metamaskTransactions={metamaskHistory}
              toggleExpandTransaction={toggleExpandTransaction}
            />
          ))
        : recentlyTransactions.length === 0 && (
            <div className="flex justify-center font-inter flex-col py-24 items-center h-[364px]   ">
              <img src="/svg/Pig.svg" alt="Transaction" />
              <h1 className="text-black-0 font-semibold mt-4">
                There are no payments in progress to this recipient yet.
              </h1>
              {account ? (
                <p className=" text-sm text-black-70 mb-8">
                  Sign up for HQ Teams and start bookkeeping all your crypto transactions!
                </p>
              ) : (
                <button
                  type="button"
                  className="bg-gray-1200 hover:bg-grey-200 text-black-0 text-base font-medium rounded-lg px-8 py-4 font-inter mt-8"
                  onClick={() => {
                    logEvent({
                      event: 'connect_wallet',
                      payload: {
                        event_category: 'Payment app',
                        event_label: '',
                        value: 1
                      }
                    })
                    if (!window.ethereum) {
                      setConnectError(true)
                    } else {
                      // login(ConnectorNames.Injected, true)
                    }
                  }}
                >
                  Connect Wallet to View
                </button>
              )}
              {account && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://ledgerx.com"
                  className="bg-gray-1200 px-8 py-4 rounded-lg text-black-0 font-semibold"
                >
                  Get Started
                </a>
              )}
            </div>
          )}
    </div>
  )
}

export default MetamaskHistory
