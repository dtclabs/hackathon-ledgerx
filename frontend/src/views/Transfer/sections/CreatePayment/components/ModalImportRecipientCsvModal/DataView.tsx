import { FC } from 'react'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import Typography from '@/components-v2/atoms/Typography'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { TrimText } from '@/components-v2/molecules/TrimText'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import { FormErrorMessage } from '@/views/Transfer/components'
import { isEmpty } from 'lodash'

interface IDataViewProps {
  data: any
  validationErrors: any
}

const COLUMNS = [
  {
    Header: '#',
    accessor: 'number'
  },
  {
    Header: 'Recipient Address',
    accessor: 'address'
  },
  {
    Header: 'Tokens',
    accessor: 'tokens'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Recipient Name',
    accessor: 'name'
  },
  {
    Header: 'Account',
    accessor: 'accounts'
  },
  {
    Header: 'Notes',
    accessor: 'notes'
  }
]

const DataView: FC<IDataViewProps> = ({ data, validationErrors }) => {
  const provider = useTableHook({})

  return (
    <SimpleTable
      defaultPageSize={10}
      tableHeight={isEmpty(validationErrors) ? 'h-[calc(100vh-328px)]' : 'h-[calc(100vh-395px)]'}
      columns={COLUMNS}
      renderRow={(row) => (
        <>
          <BaseTable.Body.Row.Cell>{+row.id + 1}.</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <div className={validationErrors[row.index]?.walletAddress ? '!text-[#C61616]' : ''}>
              <WalletAddressCopy address={row?.original?.walletAddress}>
                <WalletAddressCopy.Tooltip maxWidth="320">{row?.original?.walletAddress}</WalletAddressCopy.Tooltip>
              </WalletAddressCopy>
            </div>

            {validationErrors[row.index]?.walletAddress && (
              <FormErrorMessage errorMessage={validationErrors[row.index]?.walletAddress} />
            )}
          </BaseTable.Body.Row.Cell>

          <BaseTable.Body.Row.Cell>
            <div className="flex flex-row gap-2">
              <img
                className="rounded-full"
                src={row?.original?.tokenImage ?? 'https://placehold.co/200x200'}
                alt="token-img"
                width={20}
              />{' '}
              <div className={validationErrors[row.index]?.token ? '!text-[#C61616]' : ''}>{row?.original?.token}</div>
            </div>

            {validationErrors[row.index]?.token && (
              <FormErrorMessage errorMessage={validationErrors[row.index]?.token} />
            )}
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <div className={validationErrors[row.index]?.amount ? '!text-[#C61616]' : ''}>{row?.original?.amount}</div>
            {validationErrors[row.index]?.amount && (
              <FormErrorMessage errorMessage={validationErrors[row.index]?.amount} />
            )}
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            {row?.original?.name}
            {validationErrors[row.index]?.name && <FormErrorMessage errorMessage={validationErrors[row.index]?.name} />}
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <div className={validationErrors[row.index]?.account ? '!text-[#C61616]' : ''}>
              {row?.original?.account}
            </div>
            {validationErrors[row.index]?.account && (
              <FormErrorMessage errorMessage={validationErrors[row.index]?.account} />
            )}
          </BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>
            <TrimText label={row?.original?.note ?? ''}>
              <TrimText.Tooltip>{row?.original?.note ?? ''}</TrimText.Tooltip>
            </TrimText>
          </BaseTable.Body.Row.Cell>
        </>
      )}
      pagination={data?.length > 0}
      data={data ?? []}
      provider={provider}
    />
  )
}

export default DataView
