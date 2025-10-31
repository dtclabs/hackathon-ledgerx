/* eslint-disable react/no-array-index-key */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
import { FC } from 'react'

import { useAppSelector } from '@/state'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'

import ReviewLineItem from './ReviewLineItem'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'

import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectTokenPriceMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'

const COLUMNS = [
  {
    Header: 'Recipient',
    accessor: 'recipient',
    extendedClass: '!px-2'
  },
  {
    Header: 'You pay (Crypto)',
    accessor: 'crypto_amount',
    extendedClass: '!px-2'
  },
  {
    Header: () => <img src="/svg/icons/arrow-narrow-right.svg" alt="arrow" />,
    accessor: 'arrow',
    extendedClass: '!px-2'
  },
  {
    Header: 'Recipient gets (Fiat)',
    accessor: 'fiat_amount',
    extendedClass: '!px-2'
  },
  {
    Header: 'Account',
    accessor: 'account',
    extendedClass: '!px-2'
  },
  {
    Header: 'Notes',
    accessor: 'notes',
    extendedClass: '!px-2'
  },
  {
    Header: 'Tags',
    accessor: 'tags',
    extendedClass: '!px-2'
  },
  {
    Header: 'Files',
    accessor: 'files',
    extendedClass: '!px-2'
  }
]

interface IReviewTableProps {
  data: any
}

const ReviewTable: FC<IReviewTableProps> = ({ data }) => {
  const reviewTableProvider = useTableHook({})
  const { fiatCurrency } = useAppSelector(orgSettingsSelector)

  const cryptocurrencyPriceMap = useAppSelector(selectTokenPriceMap)

  const handleDownloadDraftFile = (draftId: string, fileId: string) => () => {
    // const fileName = fileId.slice(37)
    console.log('Download draft file', draftId, fileId)
    // downloadFile({ organizationId, id: draftId, fileId, fileName })
  }

  return (
    <SimpleTable
      columns={COLUMNS}
      data={data || []}
      pagination
      provider={reviewTableProvider}
      renderRow={(row) => (
        <ReviewLineItem
          index={row?.index}
          data={row?.original}
          fiatCurrency={fiatCurrency}
          cryptocurrencyPrices={cryptocurrencyPriceMap}
        />
      )}
    />
  )
}

export default ReviewTable
