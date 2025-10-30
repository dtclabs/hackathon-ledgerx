import { FC } from 'react'
import { IParsedPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'

import {
  DisplaySafe,
  DisplayActions,
  DisplaySigners,
  DisplayTo,
  DisplayTotalAssetAmount,
  GridTable
} from '../../components/GridTable'

interface IExecuteSectionProps {
  data: IParsedPendingTransaction[]
  onClickRow: any
  dataGridRef: any
  isLoading: boolean
  onSetSelectedTransactions?: (selections: IParsedPendingTransaction[]) => void
  onClickRejectTransaction: (data: IParsedPendingTransaction, e: any) => void
  onClickApproveTransaction: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteRejection: (data: IParsedPendingTransaction, e: any) => void
  onClickExecuteTransaction: (data: IParsedPendingTransaction, e: any) => void
  isBatchExecuteEnabled?: boolean
  selectedTransactions?: IParsedPendingTransaction[]
  permissionMap: any
}

const QueuedTransactions: FC<IExecuteSectionProps> = ({
  data,
  onClickRow,
  isLoading,
  dataGridRef,
  onSetSelectedTransactions,
  isBatchExecuteEnabled = false,
  onClickApproveTransaction,
  onClickRejectTransaction,
  onClickExecuteTransaction,
  onClickExecuteRejection,
  permissionMap
}) => {
  const isCheckboxEnabled = (_currentNonce) => {
    // Extract nonces from all data and sort
    const allNonces = data.map((item) => item.nonce).sort((a, b) => a - b)

    const selectedTransactions = dataGridRef.current.api.getSelectedRows()
    // Extract nonces from selected transactions and sort
    const selectedNonces = selectedTransactions.map((tx) => tx.nonce).sort((a, b) => a - b)

    if (selectedTransactions.length === 0 && allNonces[0] === _currentNonce) return true
    // Current nonce already exists in selected nonces
    if (selectedNonces.includes(_currentNonce)) return true

    // Current nonce is next in line
    const lastSelectedNonce = selectedNonces[selectedNonces.length - 1]
    if (_currentNonce === lastSelectedNonce + 1) return true

    return false
  }

  const columns = [
    {
      hide: !isBatchExecuteEnabled,
      headerCheckboxSelection: isBatchExecuteEnabled,
      checkboxSelection: (params) => {
        const { nonce } = params.data
        const isEnabled = isCheckboxEnabled(nonce)

        return isEnabled
      },
      maxWidth: 50,
      cellStyle: { display: 'flex', alignItems: 'center' },
      showDisabledCheckboxes: true,
      tooltipValueGetter: (p) =>
        p.node.firstChild
          ? null
          : !p.node.firstChild && p.node.parent.allLeafChildren[p.node.rowIndex - 1]?.selected
          ? null
          : 'You must select the transaction of a lower nonce first.'
    },
    {
      headerName: 'Nonce',
      field: 'nonce',
      cellStyle: { display: 'flex', alignItems: 'center', paddingLeft: 20 },
      maxWidth: 120
    },
    {
      headerName: 'Safe',
      field: 'params.data.wallet.address',
      cellRenderer: DisplaySafe
    },
    {
      headerName: 'To',
      field: 'to',
      cellRenderer: DisplayTo
    },
    {
      headerName: 'Asset Amount',
      field: 'amount',
      cellRenderer: DisplayTotalAssetAmount,
      cellRendererParams: { permissionMap }
    },
    {
      headerName: 'Status',
      field: 'status',
      cellRenderer: DisplaySigners
    },
    {
      hide: isBatchExecuteEnabled,
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: DisplayActions,
      cellRendererParams: {
        onClickExecuteRejection,
        onClickExecuteTransaction,
        onClickApproveTransaction,
        onClickRejectTransaction,
        isLoading,
        permissionMap
      }
    }
  ]

  const onSelectionChanged = (event) => {
    if (isBatchExecuteEnabled) {
      const selectedRows = event.api.getSelectedRows()

      // Sort the array by nonce
      const sortedTransactions = selectedRows.sort((a, b) => a.nonce - b.nonce)
      const allNonces = data.map((item) => item.nonce).sort((a, b) => a - b)
      const newSelected = []
      // Find the index of the lowest nonce in allNonces within currentSelected
      const startIndex = sortedTransactions.findIndex((item) => item.nonce === allNonces[0])

      // If startIndex is not found or if it's not the first index, the selection is not sequential, so we return an empty array
      if (startIndex === -1 || startIndex !== 0) {
        // Not lowest nonce
      } else {
        // Loop through the currentSelected array starting from startIndex
        for (let i = startIndex; i < sortedTransactions.length; i++) {
          // If the current nonce is not sequential, break the loop
          if (sortedTransactions[i].nonce !== allNonces[i - startIndex]) {
            break
          }
          // Otherwise, push the transaction to the newSelected array
          newSelected.push(sortedTransactions[i].nonce)
        }
      }

      dataGridRef?.current?.api?.forEachNode((rowNode) => {
        if (newSelected.includes(rowNode.data.nonce)) {
          rowNode.setSelected(true, false)
        } else {
          rowNode.setSelected(false, false)
        }
      })
      onSetSelectedTransactions(sortedTransactions)
    }
  }

  return (
    <GridTable
      gridRef={dataGridRef}
      data={data}
      columns={columns}
      isMultiSelectEnabled={isBatchExecuteEnabled}
      onRowClicked={onClickRow}
      onSelectionChanged={onSelectionChanged}
      isLoading={isLoading}
      tooltipShowDelay={0}
      getRowStyle={getQueueTxnRowStyle}
    />
  )
}

export default QueuedTransactions

// eslint-disable-next-line consistent-return
const getQueueTxnRowStyle = (params) => {
  if (params.node.rowIndex === 0) {
    return { transform: '' }
  }
}
