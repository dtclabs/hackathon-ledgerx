import { useWeb3React } from '@web3-react/core'
import { useAppSelector } from '@/state'
import { freeSelectors } from '@/state/free/reducer'

export const RECENTLY_TRANSACTIONS = 'RecentlyTransactions'

export const useRecentlyHash = () => {
  // const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const recentlyTransactions = useAppSelector(freeSelectors.recentlyTransactionsSelector)
  const pendingTransactions = recentlyTransactions
    .filter((transaction) => !transaction.isExecuted)
    .filter((item) => item.account === account)

  // const localList = window.localStorage.getItem(RECENTLY_TRANSACTIONS)

  // useEffect(() => {
  //   if (localList) {
  //     const list: IRecentlyTransaction[] = JSON.parse(localList)
  //     dispatch(setTransactions(list.filter((item) => item.account === account && item.chain === chainId).reverse()))
  //   }
  // }, [account, chainId, dispatch, localList])

  return { recentlyTransactions, pendingTransactions }
}
