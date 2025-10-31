import { IPagination } from '@/api/interface'
import { ISource } from '@/slice/wallets/wallet-types'
import { ETransactionType, ITransaction } from '@/slice/old-tx/interface'
import { networkConfigs } from '@/constants/network'
import { useUSDPrice } from '@/hooks/useUSDPrice'
import { format } from 'date-fns'
import { getTotalUSDAmount } from './getTotalUSDAmount'
import { IContacts } from '@/slice/contacts/contacts.types'

export interface ICSVExportData {
  date: string | number
  time: string | number

  hash: string | number
  tab: string

  amount: string | number
  token: string | number
  value: string | number
  currentPrice: string | number

  feeValueETH: string | number

  feeUSDValue: string | number
  feeValueCurrentPrice: string | number

  // totalUSDtxn: string | number
  // totalUSDspot: string | number

  toPayee: string | number
  nameToPayee: string | number
  fromPayee: string | number
  nameFromPayee: string | number
  signers: any[] | string

  category: string | number
  status: string | number
  note: string | number
}
export const chainID = {
  ethereum: 1,
  goerli: 5
}

export const csvExportData = (
  list: ITransaction[],
  sourceOfFunds: IPagination<ISource>,
  recipients: IContacts[],
  chainId: number,
  price: any
) => {
  const { length } = list

  const csvList: ICSVExportData[] = []
  for (let i = 0; i < length; i++) {
    const transaction = list[i]

    const recipientsLength = transaction.recipients && transaction.recipients.length
    const feeValueCurrent = transaction.fee
      ? getTotalUSDAmount(chainId, transaction.fee, price, transaction.tokenAddress)
      : ''

    // outgoing
    const sourceFrom =
      transaction && transaction?.metamaskTransaction
        ? sourceOfFunds &&
          sourceOfFunds.items &&
          sourceOfFunds.items.find(
            (item) => item?.address?.toLocaleLowerCase() === transaction?.metamaskTransaction?.from?.toLocaleLowerCase()
          )
        : transaction?.safeTransaction &&
          sourceOfFunds &&
          sourceOfFunds.items &&
          sourceOfFunds.items.find(
            (item) => item?.address?.toLocaleLowerCase() === transaction?.safeTransaction?.safe?.toLocaleLowerCase()
          )

    const recipientName = (recipient) =>
      transaction &&
      recipients &&
      recipients.find((item) => item.recipientAddresses.find((address) => address.address === recipient.address))

    const sourceTo =
      transaction &&
      transaction.metamaskTransaction &&
      recipients &&
      recipients.find((item) =>
        item.recipientAddresses.find(
          (address) => address.address.toLocaleLowerCase() === transaction.metamaskTransaction.to.toLocaleLowerCase()
        )
      )
    // incoming
    const payeeFrom =
      transaction &&
      transaction.metamaskTransaction &&
      recipients &&
      recipients.find((item) =>
        item.recipientAddresses.find(
          (address) => address.address.toLocaleLowerCase() === transaction.from.toLocaleLowerCase()
        )
      )

    const payeeTo =
      transaction &&
      transaction.metamaskTransaction &&
      sourceOfFunds &&
      sourceOfFunds.items &&
      sourceOfFunds.items.find((item) => item.address.toLocaleLowerCase() === transaction.to.toLocaleLowerCase())

    // for
    const fromPayee =
      transaction.type === ETransactionType.OUTGOING
        ? sourceFrom?.name
        : payeeFrom?.organizationName || payeeFrom?.contactName
    const toPayee =
      transaction.type === ETransactionType.OUTGOING
        ? sourceTo?.organizationName || sourceTo?.contactName
        : payeeTo?.name
    if (recipientsLength) {
      const feeValueETH = transaction.fee && (Number(transaction.fee) / recipientsLength).toString()
      const feeValueUSD = transaction.pastUSDGasFee && (Number(transaction.pastUSDGasFee) / recipientsLength).toString()
      const feeValueCurrentPrice = feeValueETH
        ? Number(getTotalUSDAmount(chainId, feeValueETH, price, transaction.tokenAddress)) / recipientsLength
        : ''

      for (let j = 0; j < recipientsLength; j++) {
        const recipient = transaction.recipients[j]
        const sourceName =
          transaction &&
          transaction.recipients[j] &&
          sourceOfFunds &&
          sourceOfFunds.items &&
          sourceOfFunds.items.find((item) => item.address === recipient.address)

        const hash =
          (transaction.metamaskTransaction && transaction.metamaskTransaction.hash) ||
          (transaction.safeTransaction && transaction.safeTransaction.transactionHash)
        csvList.push({
          date: format(new Date(transaction.timeStamp || transaction.submissionDate), 'dd MMM yyyy').toString() || '',
          time: format(new Date(transaction.timeStamp || transaction.submissionDate), 'hh:mm a').toString() || '',

          hash:
            (hash &&
              !hash.includes('-') &&
              `=HYPERLINK(""${
                networkConfigs[chainID[transaction.blockchainId]].scanUrlHash
              }tx/${hash}"",""${hash}"")`.toString()) ||
            '',
          tab: transaction.type || '',

          token:
            (transaction.symbol &&
              `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
                transaction.tokenAddress || networkConfigs[chainID[transaction.blockchainId]].disperse
              }"",""${transaction.symbol}"")`.toString()) ||
            '',
          amount: recipient.amount || '',
          value: (recipient && recipient.pastUSDPrice) || '',
          currentPrice: (recipient && recipient.currentUSDPrice) || '',
          feeValueETH: feeValueETH || '',
          feeUSDValue: Number(feeValueUSD) === 0 ? '' : feeValueUSD || '',
          feeValueCurrentPrice: feeValueCurrentPrice === 0 ? '' : feeValueCurrentPrice.toString() || '',
          toPayee:
            (recipient.address &&
              `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
                recipient.address
              }"",""${recipient.address}"")`.toString()) ||
            (transaction.to &&
              `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${transaction.to}"",""${
                recipient.address
              }"")`.toString()),

          nameToPayee: recipientName(recipient)
            ? recipientName(recipient).organizationName || recipientName(recipient).contactName
            : '',
          fromPayee:
            (sourceFrom &&
              (sourceFrom
                ? `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
                    sourceFrom.address
                  }"",""${sourceFrom.address}"")`.toString()
                : ` ${sourceFrom.address}`)) ||
            (transaction.from &&
              `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
                transaction.from
              }"",""${transaction.from}"")`.toString()),
          nameFromPayee: fromPayee || '',
          signers:
            (transaction &&
              transaction.safeTransaction &&
              transaction.safeTransaction.confirmations &&
              transaction.safeTransaction.confirmations.map((item) => item.owner)) ||
            (transaction && transaction.metamaskTransaction && transaction.metamaskTransaction.from) ||
            '',

          category: transaction.categories.map((categoryTransaction) => categoryTransaction.name).join(', ') || '',
          status: transaction.isRejectTransaction ? 'On-chain rejection' : 'Approved',
          note: transaction.comment || ''
        })
      }
    } else {
      csvList.push({
        date: format(new Date(transaction.timeStamp || transaction.submissionDate), 'dd MMM yyyy').toString() || '',
        time: format(new Date(transaction.timeStamp || transaction.submissionDate), 'hh:mm a').toString() || '',

        hash:
          (transaction.hash &&
            `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlHash}tx/${transaction.hash}"",""${
              transaction.hash
            }"")`.toString()) ||
          '',
        tab: transaction.type || '',

        token:
          transaction.symbol &&
          `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
            transaction.tokenAddress || networkConfigs[chainID[transaction.blockchainId]].disperse
          }"",""${transaction.symbol}"")`.toString(),
        amount: transaction.amount || '',
        value: (transaction && transaction.pastUSDPrice) || '',
        currentPrice: (transaction && transaction.currentUSDPrice) || '',
        feeValueETH: transaction.fee || '',
        feeUSDValue: transaction.pastUSDGasFee || '',
        feeValueCurrentPrice: feeValueCurrent || '',
        toPayee:
          transaction.to &&
          `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${transaction.to}"",""${
            transaction.to
          }"")`.toString(),
        nameToPayee: toPayee || '',
        fromPayee:
          (transaction.from &&
            (transaction.from
              ? `=HYPERLINK(""${networkConfigs[chainID[transaction.blockchainId]].scanUrlAddress}${
                  transaction.from
                }"",""${transaction.from}"")`.toString()
              : ` ${transaction.from}`)) ||
          '',
        nameFromPayee: fromPayee || '',
        signers:
          (transaction &&
            transaction.safeTransaction &&
            transaction.safeTransaction.confirmations &&
            transaction.safeTransaction.confirmations.map((item) => item.owner)) ||
          (transaction && transaction.metamaskTransaction && transaction.metamaskTransaction.from) ||
          '',

        category: transaction.categories.map((categoryTransaction) => categoryTransaction.name).join(', ') || '',
        status: transaction.isRejectTransaction ? 'On-chain rejection' : 'Approved',
        note: transaction.comment || ''
      })
    }
  }
  return csvList
}
