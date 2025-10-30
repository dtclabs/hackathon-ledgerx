/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unescaped-entities */
import FreeRemoveIcon from '@/assets/svg/FreeRemoveIcon.svg'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import UploadCategory from '@/components/UploadCategory/UploadCategory'
import categoryIcon from '@/public/svg/Document.svg'
import Load from '@/public/svg/LoaderDefault.svg'
import fileImport from '@/public/svg/file.svg'
import Image from 'next/legacy/image'
import React, { useEffect, useMemo, useState } from 'react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import CSVError from './CSVError'
import { ACCOUNT_TYPE } from '../CreateAccountModal/CreateAccountModal'
import CSVIcon from '@/public/svg/icons/csv-icon.svg'
import { debounce } from 'lodash'
import { Input } from '@/components-v2'

interface IImportCSVModal {
  importedChartOfAcconts: any[]
  onSubmit: (data: any[]) => void
  provider: any
}

const columns = [
  {
    Header: 'Code',
    accessor: 'code'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Type',
    accessor: 'type'
  }
]

const ImportCSVModal: React.FC<IImportCSVModal> = ({ importedChartOfAcconts, provider, onSubmit }) => {
  const [csvData, setCSVData] = useState([])

  const [fileCsv, setFileCsv] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileCsvError, setFileCsvError] = useState(false)
  const [showError, setShowError] = useState(false)
  const [search, setSearch] = useState('')

  const [selectedRows, setSelectedRows] = useState([])

  useEffect(() => {
    if (csvData.length > 0) {
      setIsLoading(false)
    }
  }, [csvData])

  useEffect(() => {
    if (!provider.state.isOpen) {
      setSelectedRows([])
    }
  }, [provider.state.isOpen])

  const checkIsMissingColumn = (data) => Boolean(!data.code || !data.name || !data.type)

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const parsedData = useMemo(
    () =>
      csvData.slice(1).map((item) => ({
        code: item[0].trim(),
        name: item[1].trim(),
        type: item[2].trim(),
        description: item[3].trim()
      })),
    [csvData]
  )

  const checkedData = useMemo(() => {
    const data = []
    if (parsedData?.length) {
      for (let i = 0; i < parsedData?.length; i++) {
        if (checkIsMissingColumn(parsedData[i])) {
          data.push({ ...parsedData[i], tooltip: 'Missing some field', disabled: true })
        } else if (importedChartOfAcconts.find((item) => item?.code === parsedData[i].code)) {
          data.push({ ...parsedData[i], tooltip: 'Duplicate Code', disabled: true })
        } else if (!ACCOUNT_TYPE.find((item) => item.value.toLowerCase() === parsedData[i].type.toLowerCase())) {
          data.push({ ...parsedData[i], tooltip: 'Wrong type', disabled: true })
        } else {
          data.push({ ...parsedData[i] })
        }
      }
    }
    return data
  }, [importedChartOfAcconts, parsedData])

  const importCSVModalContent = useMemo(() => {
    if (isLoading) {
      return {
        primaryCTA: 'Please wait...',
        disabled: true
      }
    }
    if (fileCsv && fileCsv.type === 'text/csv' && csvData?.length > 0) {
      return {
        primaryCTA: `Confirm Import Selection (${selectedRows?.length || '-'})`,
        disabled: selectedRows?.length === 0,
        isSubmit: true
      }
    }
    if ((fileCsv && fileCsv.type !== 'text/csv') || fileCsvError) {
      return {
        primaryCTA: 'Upload another file'
      }
    }
    return {
      headerTitle: 'Import Chart of Accounts (.CSV)',
      headerSubTitle: 'This adds multiple accounts at the same time.'
    }
  }, [csvData?.length, fileCsv, fileCsvError, isLoading, selectedRows?.length])

  const handleOnClickCancel = () => {
    provider.methods.setIsOpen(false)
    setFileCsv(null)
    setCSVData([])
  }

  const handleOnClickCta = () => {
    if (importCSVModalContent.isSubmit) {
      if (selectedRows?.length) {
        onSubmit(selectedRows)
      }
      provider.methods.setIsOpen(false)
    } else {
      setFileCsv(null)
      setCSVData([])
      setIsLoading(false)
      setFileCsvError(null)
    }
  }

  useEffect(() => {
    if (!provider.state.isOpen) {
      setFileCsv(null)
      setCSVData([])
      setIsLoading(false)
      setFileCsvError(null)
    }
  }, [setCSVData, provider.state.isOpen])

  const handleRemoveFile = () => {
    setFileCsv(null)
    setCSVData([])
    setIsLoading(false)
    setFileCsvError(null)
  }

  return (
    <BaseModal provider={provider} width="650">
      <BaseModal.Header>
        <BaseModal.Header.HeaderIcon icon={CSVIcon} />
        <BaseModal.Header.Title>{importCSVModalContent?.headerTitle || 'Import .CSV'}</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton />
      </BaseModal.Header>

      <BaseModal.Body>
        <div className="pr-24">
          {importCSVModalContent?.headerSubTitle ? (
            <Typography color="secondary" variant="body2">
              {importCSVModalContent?.headerSubTitle}
            </Typography>
          ) : (
            <Typography color="secondary" variant="body2">
              Upload a .csv file with the following columns: Code, Name, Type and Description (optional).{' '}
              <a
                href="/file/chart-of-accounts.csv"
                download
                className=" text-neutral-900 leading-5 tracking-wide underline"
              >
                Download sample .CSV file
              </a>
            </Typography>
          )}
        </div>
        {!fileCsv ? (
          <div className="mt-8">
            <Typography color="secondary" variant="body2">
              Upload a .csv file with the following columns: Code, Name, Type and Description (optional).{' '}
              <a
                href="/file/chart-of-accounts.csv"
                download
                className=" text-neutral-900 leading-5 tracking-wide underline"
              >
                Download sample .CSV file
              </a>
            </Typography>
            <div className="mt-8 border border-dashed border-gray-10 rounded-lg">
              <UploadCategory
                setFileCsvError={setFileCsvError}
                setIsLoading={setIsLoading}
                setData={setCSVData}
                data={csvData}
                setShowError={setShowError}
                setFileCsv={setFileCsv}
              />
            </div>
          </div>
        ) : fileCsv && fileCsv.type === 'text/csv' ? (
          isLoading ? (
            <div className="flex font-inter mt-8">
              <div className="border w-full rounded-lg flex items-center justify-between h-full">
                <div className="flex">
                  <div className="ml-6 flex items-center">
                    <Image src={fileImport} />
                  </div>
                  <input
                    className="mx-4 my-[18px] h-full outline-none font-medium text-[#787878]"
                    type="text"
                    defaultValue={fileCsv && fileCsv.name}
                  />
                </div>
                <div className="flex gap-2 mr-6 items-center text-[#787878] text-sm leading-4">
                  <Typography variant="body2">Uploading</Typography>
                  <div className="animate-spin w-5 h-5">
                    <Image src={Load} alt="loading" />
                  </div>
                </div>
              </div>
              <button
                className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14"
                onClick={() => setFileCsv(null)}
                type="button"
              >
                <Image
                  aria-hidden
                  className="cursor-pointer"
                  width={14}
                  height={14}
                  src={FreeRemoveIcon}
                  alt="removeIcon"
                />
              </button>
            </div>
          ) : fileCsvError ? (
            <CSVError onRemoveFile={handleRemoveFile} fileCsv={fileCsv} />
          ) : (
            <>
              <Typography color="secondary" variant="body2" classNames="mt-6">
                Uploaded file:
              </Typography>
              <div className="mt-2 flex items-center justify-between px-6 py-4 border rounded-md">
                <Typography color="primary" variant="body2">
                  {fileCsv.name}
                </Typography>
                <UploadCategory
                  setFileCsvError={setFileCsvError}
                  setIsLoading={setIsLoading}
                  setData={setCSVData}
                  data={csvData}
                  setShowError={setShowError}
                  setFileCsv={setFileCsv}
                  isChangeFile
                />
              </div>
              <div className="flex gap-2 items-center justify-between flex-1 mt-4">
                <div className="basis-2/5">
                  <Input
                    placeholder="Search by code, name..."
                    id="txhash"
                    onChange={debounce(handleSearch, 300)}
                    isSearch
                    classNames="h-[32px]"
                  />
                </div>
                <Typography color="secondary" variant="body2">
                  Selected accounts: <b>{selectedRows?.length || 0}</b>
                </Typography>
              </div>
              <div className="font-inter mt-4">
                <SimpleTable
                  defaultPageSize={100}
                  multiSelect
                  provider={provider}
                  pagination
                  keepSelectedRows
                  onRowSelected={(rows) => setSelectedRows(rows)}
                  tableHeight="h-[400px]"
                  noData={
                    <div className="p-8 flex justify-center">
                      <EmptyData loading={false}>
                        <EmptyData.Icon icon={categoryIcon} />
                        <EmptyData.Title>No Chart of Accounts found</EmptyData.Title>
                      </EmptyData>
                    </div>
                  }
                  renderRow={(row) =>
                    row.cells.map((cell) => (
                      <BaseTable.Body.Row.Cell {...cell.getCellProps()}>
                        {cell.render('Cell')}
                        {cell.column.id === 'name' && (
                          <div style={{ color: '#777675', overflow: 'hidden', maxWidth: 550 }}>
                            {row.original.description}
                          </div>
                        )}
                      </BaseTable.Body.Row.Cell>
                    ))
                  }
                  columns={columns}
                  data={checkedData || []}
                  clientSideSearch={search}
                />
              </div>
            </>
          )
        ) : fileCsv && fileCsv.type !== 'text/csv' ? (
          <CSVError onRemoveFile={handleRemoveFile} fileCsv={fileCsv} />
        ) : (
          ''
        )}
      </BaseModal.Body>
      {importCSVModalContent?.primaryCTA && (
        <BaseModal.Footer>
          <BaseModal.Footer.SecondaryCTA onClick={handleOnClickCancel} label="Cancel" />
          <BaseModal.Footer.PrimaryCTA
            onClick={handleOnClickCta}
            disabled={importCSVModalContent?.disabled}
            label={importCSVModalContent?.primaryCTA}
          />
        </BaseModal.Footer>
      )}
    </BaseModal>
  )
}

export default ImportCSVModal
