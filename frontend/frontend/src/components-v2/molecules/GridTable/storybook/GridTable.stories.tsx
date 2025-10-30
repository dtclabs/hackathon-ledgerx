import Typography from '@/components-v2/atoms/Typography'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { toShort } from '@/utils/toShort'
import { Meta, StoryFn } from '@storybook/react'
import Avvvatars from 'avvvatars-react'
import { format } from 'date-fns'
import { useRef } from 'react'
import { GridTable } from '../index'
import { mockData } from './data'

export default {
  title: 'Molecules/Grid Table',
  component: GridTable,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as Meta<typeof GridTable>

const Template: StoryFn<typeof GridTable> = (args) => {
  const gridRef = useRef(null)

  const columns = [
    {
      headerName: 'Name',
      field: 'name',
      cellRenderer: DisplayName
    },
    {
      headerName: 'Wallet Address',
      field: 'recipientAddresses',
      cellRenderer: DisplayWallet
    },
    {
      headerName: 'Bank Account',
      field: 'to',
      cellRenderer: DisplayBankAccount
    },
    {
      headerName: 'Type',
      field: 'type',
      cellStyle: {
        textTransform: 'capitalize'
      }
    },
    {
      headerName: 'Last Updated',
      field: 'updatedAt',
      valueFormatter: (params) =>
        params?.data?.updatedAt ? format(new Date(params.data.updatedAt), 'dd MMM yyyy, hh:mm') : ''
    }
  ]

  return (
    <div className="h-[50vh] w-full">
      <GridTable
        data={mockData}
        hasCheckBox
        isMultiple
        gridRef={gridRef}
        columns={columns}
        pagination
        emptyState={<div>Empty</div>}
        id="test-grid"
        isLoading
        rowHeight={60}
      />
    </div>
  )
}

const DisplayName = (params) => {
  const name = params.data.organizationName || params.data.contactName
  return (
    <div className="flex items-center gap-2">
      <div>
        <Avvvatars style="shape" size={32} value={name} />
      </div>

      {name?.length > 25 ? (
        <div className="truncate pr-5 flex-1">
          <span>{toShort(name, 25, 0)}</span>
        </div>
      ) : (
        <div className="truncate pr-5 flex-1">{name}</div>
      )}
    </div>
  )
}
const DisplayWallet = (params) => {
  const addresses = params.data.recipientAddresses
  return (
    <div className="flex-1 pr-5">
      {addresses?.length > 1 ? (
        `${addresses?.length} addresses`
      ) : addresses?.length === 1 ? (
        <WalletAddress split={5} address={addresses[0]?.address} color="dark">
          <WalletAddress.Link address={addresses[0]?.address} />
          <WalletAddress.Copy address={addresses[0]?.address} />
        </WalletAddress>
      ) : (
        '-'
      )}
    </div>
  )
}
const DisplayBankAccount = (params) => {
  const bankAccounts = params.data.recipientBankAccounts
  return (
    <div className="flex flex-col truncate laptop:max-w-[160px] 2xl:max-w-[240px]">
      {bankAccounts?.length > 1 ? (
        `${bankAccounts?.length} bank accounts`
      ) : bankAccounts?.length === 1 ? (
        <>
          <Typography>{bankAccounts[0]?.accountNumberLast4}</Typography>
          <Typography color="secondary" variant="caption" classNames="truncate">
            {bankAccounts[0]?.bankName}
          </Typography>
        </>
      ) : (
        '-'
      )}
    </div>
  )
}

export const SimpleGrid = Template.bind({})

SimpleGrid.args = {}
