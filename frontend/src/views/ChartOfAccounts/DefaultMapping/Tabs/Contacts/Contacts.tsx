import { FC, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/legacy/image'
import { debounce } from 'lodash'
import TextField from '@/components/TextField/TextField'
import { Divider } from '@/components-v2/Divider'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import Typography from '@/components-v2/atoms/Typography'
import ContactMappingRow from '../../components/ContactsMappingRow'
import { Pagination } from '@/components-v2/molecules/Pagination'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'

interface IProps {
  organizationId: string
  parsedChartOfAccounts: any
  contacts: any
  isLoading: boolean
  onChangeAccount: any
  chartOfAccountsMapping: any
}

const ContractsTab: FC<IProps> = ({
  organizationId,
  parsedChartOfAccounts,
  contacts,
  isLoading,
  onChangeAccount,
  chartOfAccountsMapping
}) => {
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState<number>(10) // setting default items per page 5
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(null)
  const [pageData, setPageData] = useState([]) // setting paginated data from all the data received from server
  const router = useRouter()
  const showBanner = useAppSelector(showBannerSelector)
  const handleRedirectToContacts = () => {
    router.push(`/${organizationId}/contacts`)
  }

  const handleOnChangeAccount = (_contact, _value) => {
    // const recipentCoaMapping = chartOfAccountsMapping.find((item) => item.recipientId === _contact.publicId) || {}

    onChangeAccount(_contact, _value)
  }

  const handleOnChangeSearch = (e: any) => {
    setSearch(e?.target?.value)
  }

  const mapAccountToContacts = useMemo(() => {
    const CONTACT_MAP = {}

    if (search) {
      const filteredContacts = contacts?.filter(
        (contact) =>
          contact?.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
          contact?.contactName?.toLowerCase().includes(search.toLowerCase())
      )
      filteredContacts?.forEach((contact) => {
        const recipentCoaMapping = chartOfAccountsMapping?.filter((item) => item.recipientId === contact.publicId)
        CONTACT_MAP[contact.publicId] = {
          mappings: recipentCoaMapping || [],
          ...contact
        }
      })
    } else {
      contacts?.forEach((contact) => {
        const recipentCoaMapping = chartOfAccountsMapping?.filter((item) => item.recipientId === contact.publicId)
        CONTACT_MAP[contact.publicId] = {
          mappings: recipentCoaMapping || [],
          ...contact
        }
      })
    }

    return CONTACT_MAP
  }, [contacts, chartOfAccountsMapping, search])

  useEffect(() => {
    const mapAccountToContactsData =
      Object.entries(mapAccountToContacts).length > 0 ? Object.entries(mapAccountToContacts) : []
    setTotalPages(Math.ceil(mapAccountToContactsData.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const newData = mapAccountToContactsData.slice(startIndex, endIndex)
    setPageData(newData)
  }, [currentPage, mapAccountToContacts, itemsPerPage])

  if (isLoading || contacts?.length === 0) {
    return (
      <div className=" pr-14 pt-6 ">
        <div className="flex flex-col h-full gap-8 pl-14">
          <div className="pt-6">
            <EmptyData loading={isLoading}>
              <EmptyData.Icon />
              <EmptyData.Title>No Contacts Found</EmptyData.Title>
              <EmptyData.Subtitle>Add some contacts so you can map your accounts</EmptyData.Subtitle>
              <EmptyData.CTA label="Import Contact" onClick={handleRedirectToContacts} />
            </EmptyData>
          </div>
        </div>
      </div>
    )
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  function onChangePageSizeHandler(e) {
    setItemsPerPage(e.target.value)
    setCurrentPage(1)
  }
  function onClickFirstPageHandler() {
    setCurrentPage(1)
  }
  function onClickLastPageHandler() {
    setCurrentPage(totalPages)
  }

  function onPageChangePageHandler(page: number) {
    setCurrentPage(page)
  }

  const defaultPageSizeOptions = [5, 10, 20]

  return (
    <div className=" overflow-x-hidden overflow-y-auto ">
      <Typography classNames="mt-6 mb-6 mx-6" variant="body1" styleVariant="medium">
        Select an account to automatically map a transaction made to the contact. This will override any other rules.
      </Typography>
      <div className="mb-4 mx-6">
        <TextField name="search" placeholder="Search by name..." onChange={debounce(handleOnChangeSearch, 300)} />
      </div>
      <div className={`${showBanner ? 'h-[calc(100vh-482px)]' : 'h-[calc(100vh-414px)]'}  overflow-y-auto`}>
        {pageData.length > 0 ? (
          pageData.map(([key, value], index) => (
            <div className="mb-4 pl-14">
              <div className="flex flex-row ">
                <div className="mt-4 pl-2">
                  <ContactMappingRow
                    index={index}
                    title={value?.organizationName ? value?.organizationName : value?.contactName}
                    options={parsedChartOfAccounts}
                    organizationType={value?.organizationName}
                    onChangeAccount={handleOnChangeAccount}
                    accountFrom={value?.mappings?.find((account) => account?.direction === 'incoming')}
                    accountTo={value?.mappings?.find((account) => account?.direction === 'outgoing')}
                    recipientAddresses={value?.recipientAddresses}
                  />
                </div>
              </div>

              <div className="pr-6">
                <Divider />
              </div>
            </div>
          ))
        ) : (
          <div className="h-[600px] flex justify-center">
            <EmptyData loading={isLoading}>
              <EmptyData.Icon />
              <EmptyData.Title>No Contacts Found</EmptyData.Title>
              <EmptyData.Subtitle>Please try to search for another contact</EmptyData.Subtitle>
            </EmptyData>
          </div>
        )}
      </div>

      <div className="pl-14 pt-4">
        {Object.entries(mapAccountToContacts).length > 0 ? (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage - 1}
            currentPageSize={itemsPerPage}
            onPageChange={onPageChangePageHandler}
            onClickPreviousPage={prevPage}
            onClickNextPage={nextPage}
            onClickFirstPage={onClickFirstPageHandler}
            onClickLastPage={onClickLastPageHandler}
            canPreviousPage={currentPage !== 1}
            canNextPage={totalPages !== currentPage}
            pageSizeOptions={defaultPageSizeOptions}
            onChangePageSize={onChangePageSizeHandler}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default ContractsTab
