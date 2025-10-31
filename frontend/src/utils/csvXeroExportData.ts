import { networkConfigs } from '@/constants/network'
import { format } from 'date-fns'
import { getTotalUSDAmount } from '@/utils/getTotalUSDAmount'
import { IPagination } from '@/api/interface'
import { ISource } from '@/slice/wallets/wallet-types'
import { ITransaction } from '@/slice/old-tx/interface'
import { chainID } from './csvExportData'

export interface ICSVXeroExportData {
    date: string | number
    amount: string | number
    payee: string | number
    description: string | number
    reference: string | number
    analysisCode: string | number
}

export const csvXeroExportData = (
    list: ITransaction[],
    sourceOfFunds: IPagination<ISource>,
    chainId: number,
    price: any
) => {
    const { length } = list
    const csvXeroList: ICSVXeroExportData[] = []
    for (let i = 0;i < length;i++) {
        const txn = list[i]
        const recipientsLength = txn.recipients && txn.recipients.length
        const currentValueFee = txn.fee ? getTotalUSDAmount(chainId, txn.fee, price, txn.tokenAddress) : ''

        // payer source
        const sourceFrom = txn && txn.metamaskTransaction && sourceOfFunds && sourceOfFunds.items && sourceOfFunds.items.find((item) => item.address === txn.metamaskTransaction.from)

        // payee source
        const sourceTo = txn && txn.metamaskTransaction && sourceOfFunds && sourceOfFunds.items && sourceOfFunds.items.find((item) => item.address === txn.metamaskTransaction.to)

        if (recipientsLength) {
            const valueFeeETH = txn.fee && (Number(txn.fee) / recipientsLength).toString()
            const valueFeeUSD = txn.pastUSDGasFee && (Number(txn.pastUSDGasFee) / recipientsLength).toString()
            const currentValueFeePrice = valueFeeETH ? Number(getTotalUSDAmount(chainId, valueFeeETH, price, txn.tokenAddress)) / recipientsLength : ''

            for (let j = 0;j < recipientsLength;j++) {
                const recipient = txn.recipients[j]
                const sourceName = txn && txn.recipients[j] && sourceOfFunds && sourceOfFunds.items && sourceOfFunds.items.find((item) => item.address === recipient.address)

                csvXeroList.push({
                    date: format(new Date(txn.timeStamp || txn.submissionDate), 'dd MMM yyyy').toString() || '',
                    amount: recipient.amount || '',
                    payee: sourceName && sourceName.name || recipient && recipient.address || '',
                    description: txn.comment || '',
                    reference: (recipient.address && `=HYPERLINK(""${networkConfigs[chainID[txn.blockchainId]].scanUrlAddress}${recipient.address}"")`.toString()) || '',
                    analysisCode: txn.categories.map((categoryTransaction) => (categoryTransaction.name)).join(',') || ''
                })
            }
        }
    }
    return csvXeroList
}