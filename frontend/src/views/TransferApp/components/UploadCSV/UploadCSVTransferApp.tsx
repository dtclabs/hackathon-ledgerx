/* eslint-disable react/no-unescaped-entities */
import FreeRemoveIcon from '@/assets/svg/FreeRemoveIcon.svg'
import LiteUploadCSVFile from '@/components/LiteUploadCSVFIle/LiteUploadCSVFile'
import Modal from '@/components/Modal'
import ErrorPopUp from '@/components/PopUp/ErrorPopUp/ErrorPopUp'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import useFreeContext from '@/hooks/useFreeContext'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import fileImport from '@/public/svg/file.svg'
import fileReject from '@/public/svg/filereject.svg'
import fileSuccess from '@/public/svg/fileSuccess.svg'
import iconInformation from '@/public/svg/iconInfomation.svg'
import Load from '@/public/svg/LoaderDefault.svg'
import { formatNumber } from '@/utils/formatNumber'
import { isNumber } from '@/utils/isNumber'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'ethers/lib/utils'
import Image from 'next/legacy/image'
import React, { useCallback, useEffect, useState } from 'react'
import ReviewCSVItem from './ReviewCSVItem'
import recipientIcon from '@/assets/svg/users-plus.svg'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import NotFound from '@/components/NotFound'

interface IUploadCSVTransferApp {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  setCSVData: (file: any) => void
  csvData: any
  callback: (list: any[]) => void
  showMaximumError: boolean
  sourceAddress: string
  isRemarkColumn: boolean
  setIsRemarkColumn: (data: boolean) => void
  subTitle: string
  columnName: string
  optionName: string
}

const UploadCSVTransferApp: React.FC<IUploadCSVTransferApp> = ({
  showModal,
  setShowModal,
  setCSVData,
  csvData,
  callback,
  showMaximumError,
  sourceAddress,
  isRemarkColumn,
  setIsRemarkColumn,
  columnName,
  subTitle,
  optionName
}) => {
  const { account } = useWeb3React()
  const { tokens, networkConfig: networkConfigs } = useFreeContext()

  const [showError, setShowError] = useState(false)
  const [fileCsv, setFileCsv] = useState(null)

  const [fileCsvError, setFileCsvError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalEnd, setModalEnd] = useState(false)
  const [csvResult, setCsvResult] = useState([])
  const [csvResultImport, setCsvResultImport] = useState([])

  const [correctToken, setCorrectToken] = useState(networkConfigs.nativeToken)

  const safeService = useSafeServiceClient()
  const [addressExists, setAddressExists] = useState([])

  const remark = csvResult && csvResult.filter((item) => item[3])

  useEffect(() => {
    if (!csvData) {
      setCorrectToken(networkConfigs.nativeToken)
    }
  }, [csvData])

  useEffect(() => {
    if (csvData.length === 1) {
      setIsLoading(false)
    }
  }, [csvData.length])

  const handleCancel = () => {
    setShowModal(false)
    setFileCsv(null)
    setCsvResultImport([])
    setCsvResult([])
    setCSVData([])
  }
  const handleEndModal = () => {
    callback(csvResultImport)
    setModalEnd(true)
  }
  useEffect(() => {
    if (!showModal) {
      setFileCsv(null)
      setCsvResultImport([])
      setCsvResult([])
      setCSVData([])
    }
  }, [setCSVData, showModal])

  const tokenNames = tokens.map((item) => item.name)
  const token = (key: string) => {
    if (key && key.toLowerCase() === networkConfigs.nativeToken.toLowerCase()) {
      return true
    }
    return tokenNames.find((name) => name === key)
  }
  const tokenLogoUrl = (key: string) => {
    const tokenData = tokens.find((tokenItem) => tokenItem.name === key)
    return (tokenData && tokenData.logoUrl) || networkConfigs.nativeLogo
  }
  const nativeToken = networkConfigs.nativeToken.toLowerCase()
  const tokenName = tokens.map((item) => item.symbol.toLowerCase())

  const validDecimal = (amount: string | number, checkToken: string) => {
    const result = tokens.find((supportToken) => supportToken.symbol.toLowerCase() === checkToken.toLowerCase())
    const amountValue =
      Number(amount) > 100 ? Number(amount) : formatNumber(amount, { locate: 'en-US', maximumFractionDigits: 20 })

    if (amountValue && Number(amountValue) > 0 && result) {
      if (amountValue === 0) {
        return true
      }
      if (amountValue.toString().includes('.')) {
        const amountDecimal = amountValue.toString().split('.')[1].length
        return result.decimal < amountDecimal
      }
      return false
    }
    return true
  }

  const checkValidate = useCallback(async () => {
    let tokenTemp: string

    if (csvData.length >= 1) {
      let addressColumn = null
      let tokenColumn = null
      let amountColumn = null
      let correctRow = 0
      let isMetamask = false
      if (sourceAddress === account) {
        isMetamask = true
      }
      for (let i = 1; i < csvData.length; i++) {
        const columns = csvData[i].length
        for (let j = 0; j < columns; j++) {
          let caseCheck: boolean
          const checkGnosis = async (address: string) => {
            caseCheck = isAddress(csvData[i][j])
            if (sourceAddress === account && caseCheck) {
              try {
                const gnosisInfo = await safeService.getSafeInfo(address)
                if (gnosisInfo) caseCheck = false
              } catch (error) {
                sentryCaptureException(error)
                caseCheck = true
              }
            }
          }
          if (csvData[i][j]) {
            await checkGnosis(csvData[i][j])
            if (tokenName.includes(csvData[i][j].toLowerCase()) && !caseCheck && !tokenColumn) {
              if (!tokenTemp) {
                const tokenTempName = tokenName.includes(csvData[i][j].toLowerCase()) && csvData[i][j]
                if (tokenTempName) {
                  tokenTemp = csvData[i][j]
                  setCorrectToken(csvData[i][j])
                }
              }
              tokenColumn = j
            } else if (isNumber(csvData[i][j].toLowerCase()) && !caseCheck && !amountColumn) {
              amountColumn = j
            } else if (caseCheck && !addressColumn) {
              addressColumn = j
            }
          }
        }
        if (
          typeof tokenColumn === 'number' &&
          typeof amountColumn === 'number' &&
          typeof addressColumn === 'number' &&
          tokenTemp &&
          validDecimal(csvData[i][amountColumn], tokenTemp)
        ) {
          correctRow = i
          break
        } else {
          tokenColumn = null
          amountColumn = null
          addressColumn = null
        }
      }
      if (tokenColumn) {
        const temp = []
        const array1 = [0, 1, 2, 3]
        const remarkColumn = array1.filter(
          (item) => item !== addressColumn && item !== amountColumn && item !== tokenColumn
        )

        for (let i = 1; i < csvData.length; i++) {
          temp.push([])
          temp[i - 1].push(csvData[i][addressColumn])
          temp[i - 1].push(csvData[i][tokenColumn])
          temp[i - 1].push(csvData[i][amountColumn])
          temp[i - 1].push(csvData[i][remarkColumn[0]])
        }
        setCsvResult(temp)
      } else {
        setCsvResult(csvData.slice(1))
      }
    }
  }, [account, csvData])

  useEffect(() => {
    if (csvData.length !== 0) checkValidate()
  }, [csvData, checkValidate])

  useEffect(() => {
    const callBack = async () => {
      const arr = []
      if (csvResult) {
        const { length } = csvResult
        const tokenSymbol = correctToken || nativeToken
        for (let i = 0; i < length; i++) {
          const address = isAddress(csvResult[i][0]) && csvResult[i][0]
          const amount =
            isNumber(csvResult[i] && csvResult[i][2] && Number(csvResult[i][2].toLowerCase())) && csvResult[i][2]
          const tokenTempName =
            tokenName.includes(csvResult[i] && csvResult[i][1] && csvResult[i][1].toLowerCase()) && csvResult[i][1]
          const isInvalidAmount = amount && validDecimal(amount, tokenSymbol)
          if (address && tokenSymbol && amount && !isInvalidAmount && tokenTempName) {
            if (sourceAddress === account) {
              try {
                await safeService.getSafeInfo(csvResult[i][0])
              } catch (error) {
                sentryCaptureException(error)
                arr.push(csvResult[i])
              }
            } else arr.push(csvResult[i])
          }
        }
      }

      setCsvResultImport(arr)
      const newAddressExists = []
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          // eslint-disable-next-line eqeqeq
          if (arr[i][0] == arr[j][0]) {
            newAddressExists.push(arr[j][0])
          }
        }
      }
      setAddressExists(newAddressExists)
      setIsLoading(false)
    }

    if (csvResult && csvResult.length) callBack()
  }, [csvResult])
  useEffect(() => {
    if (showModal) setShowError(false)
  }, [showModal])

  useEffect(() => {
    if (showMaximumError) {
      setFileCsv(null)
      setModalEnd(false)
    }
  }, [showMaximumError])

  useEffect(() => {
    setCsvResultImport([])
  }, [fileCsv])

  useEffect(() => {
    for (let i = 0; i < csvResult.length; i++) {
      if (csvResult[i][3]?.length >= 1) {
        setIsRemarkColumn(true)
        return
      }
      setIsRemarkColumn(false)
    }
  }, [csvResult])

  return (
    <div>
      {showModal && (
        <Modal setShowModal={setShowModal} showModal={showModal}>
          {!modalEnd ? (
            <div>
              <div className="bg-white shadow-free-modal rounded-3xl">
                <div className="flex justify-between items-center  px-8 py-9 border-b border-[#EBEDEF]">
                  <h1 className="text-black-0 text-2xl left-8 font-supply">IMPORT .CSV</h1>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setCsvResultImport([])
                      setCsvResult([])
                      setCSVData([])
                    }}
                  >
                    <img src="/svg/BorderClose.svg" alt="Close" />
                  </button>
                </div>
                {!fileCsv ? (
                  <div>
                    <div className="p-8">
                      <div className="text-grey-50 text-base leading-5 tracking-[2%] font-inter">
                        <p>{subTitle}</p>
                        <div className="flex mt-1 items-center">
                          <p className="mr-2 ">{columnName}</p>
                          <a
                            href="/file/LX-bulk-transfer-template.csv"
                            download
                            className="mr-2 text-neutral-900 text-base leading-5 tracking-wide underline"
                          >
                            Download sample .CSV file
                          </a>
                          <Tooltip
                            position={ETooltipPosition.BOTTOMLOW}
                            shortText={<Image src={iconInformation} />}
                            text={
                              <div className="bg-gray-1200 px-5 pt-5 rounded-[9px] border border-[#E4E3E7]">
                                <div className="bg-gray-50 rounded-t-lg h-[100px]">
                                  <div className="flex p-3 justify-between text-[#667085] text-[10px] leading-4">
                                    <div className="w-[109px]">Recipient Address</div>
                                    <div className="w-[89px]">Token</div>
                                    <div className="w-[89px]">Amount</div>
                                    <div className="w-[89px]">Recipient Name</div>
                                  </div>
                                  <div className="flex p-3 justify-between border-y border-gray-1200 border-solid">
                                    <div className="w-[109px]">
                                      <div className="bg-[#E1E5E9] w-[78px] h-[15px] rounded-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#E1E5E9] w-[48px] h-[15px] rounded-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#E1E5E9] w-[48px] h-[15px] rounded-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#E1E5E9] w-[48px] h-[15px] rounded-[5px]" />
                                    </div>
                                  </div>

                                  <div className="flex p-3 justify-between">
                                    <div className="w-[109px]">
                                      <div className="bg-[#F3F5F7] w-[78px] h-[7px] rounded-t-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#F3F5F7] w-[48px] h-[7px] rounded-t-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#F3F5F7] w-[48px] h-[7px] rounded-t-[5px]" />
                                    </div>
                                    <div className="w-[89px]">
                                      <div className="bg-[#F3F5F7] w-[48px] h-[7px] rounded-t-[5px]" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pb-1">
                      <div className="mx-8 mb-8 border border-dashed border-gray-10 rounded-lg ">
                        <div className="">
                          <LiteUploadCSVFile
                            setFileCsvError={setFileCsvError}
                            setIsLoading={setIsLoading}
                            setData={setCSVData}
                            data={csvData}
                            setShowError={setShowError}
                            setFileCsv={setFileCsv}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : fileCsv && fileCsv.type === 'text/csv' ? (
                  isLoading ? (
                    <div>
                      <div className="p-8">
                        <div className="flex font-inter">
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
                              <p>Uploading</p>
                              <div className="animate-spin w-5 h-5">
                                <Image src={Load} alt="loading" />
                              </div>
                            </div>
                          </div>
                          <button
                            className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14"
                            onClick={() => {
                              setFileCsv(null)
                              setCsvResultImport([])
                              setCsvResult([])
                              setCSVData([])
                            }}
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
                        <div className="pt-8 flex font-inter">
                          <button
                            className="py-4 px-8 bg-[#F3F5F7] rounded-lg text-base font-semibold leading-6"
                            onClick={() => handleCancel()}
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="py-4 text-white bg-grey-900 ml-4 rounded-lg w-full font-semibold text-base leading-6"
                          >
                            Please Wait
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : fileCsvError ? (
                    <div className="max-w-[600px]">
                      <div>
                        <div className="flex p-8">
                          <div>
                            <div className="border w-full border-[#E93636] text-[#E93636] rounded-lg flex items-center justify-between h-14">
                              <div className="flex w-full">
                                <div className="ml-6 flex items-center">
                                  <Image src={fileReject} />
                                </div>

                                <input
                                  className="mx-4 my-[18px] w-full h-full outline-none font-inter"
                                  type="text"
                                  defaultValue={fileCsv[0] ? fileCsv[0].file.name : fileCsv ? fileCsv.name : ''}
                                />
                              </div>
                              {/*
                              <div className="flex gap-2 mr-6">
                                <Image src={reject} />
                              </div> */}
                            </div>
                            <div className="flex items-center font-inter font-medium text-sm leading-4 text-[#E93636] gap-2 pt-2">
                              <img src="/svg/warning.svg" alt="warning" />
                              <p className="font-medium">
                                Error in file upload, please{' '}
                                <a className="underline" href="/file/LX-bulk-transfer-template.csv" download>
                                  download the sample .CSV
                                </a>{' '}
                                file to ensure you're using the right structure
                              </p>
                            </div>
                          </div>
                          <button
                            className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14"
                            onClick={() => {
                              setFileCsv(null)
                              setCsvResultImport([])
                              setCsvResult([])
                              setCSVData([])
                            }}
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

                        <div className="p-8 flex font-inter border-t border-solid border-[#EBEDEF]">
                          <button
                            onClick={() => handleCancel()}
                            className="py-4 px-8 bg-[#F3F5F7] rounded-lg text-base font-semibold leading-6"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFileCsv(null)
                              setCsvResultImport([])
                              setCsvResult([])
                              setCSVData([])
                            }}
                            className="py-4 text-white bg-grey-900 hover:bg-grey-901 ml-4 rounded-lg w-full font-semibold text-base leading-6"
                          >
                            Upload Another File
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="font-inter">
                      <p className="pt-8 pl-8 text-[#787878] text-base leading-6 tracking-wide">
                        Here's the data from the CSV file you imported.
                      </p>
                      <p className="pl-8 pt-2 text-neutral-900 text-base leading-6 tracking-wide">
                        The free version supports only up to {process.env.NEXT_PUBLIC_MAXIMUM_RECIPIENTS || 10} lines.
                      </p>
                      {/* <a className="pl-8 text-base text-neutral-900 underline" href="/">
                        Check out our full version
                      </a> */}
                      <div className="pl-8 pt-4 text-neutral-900 text-base leading-6 tracking-wide">
                        {csvData.length === 1 ? (
                          <p className="whitespace-nowrap  text-sm">
                            No recipient address detected. Please upload file again.
                          </p>
                        ) : (
                          <div className="flex">
                            {' '}
                            <p>
                              {' '}
                              {csvResultImport.length > Number(process.env.NEXT_PUBLIC_MAXIMUM_RECIPIENTS)
                                ? Number(process.env.NEXT_PUBLIC_MAXIMUM_RECIPIENTS)
                                : csvResultImport.length}{' '}
                            </p>
                            <div>/</div> <p> {csvData.length - 1} </p>{' '}
                            <p className="pl-1">recipients can be imported from this file</p>{' '}
                          </div>
                        )}
                      </div>
                      <div className="mx-8 mb-8 text-sm mt-8 leading-4 rounded-lg">
                        <div className=" rounded-lg ">
                          <div>
                            <table className=" rounded-lg w-full ">
                              <thead>
                                <tr>
                                  <th className="p-0">
                                    <div className="w-full bg-[#F8F9FA] rounded-tl-lg rounded-tr-lg border-x border-t border-[#DDE2E7] ">
                                      <div>
                                        <div className="flex  text-[#727B84]">
                                          <div className="py-4 pl-4 text-left ">
                                            <div className="w-[380px]">Recipient Address</div>
                                          </div>
                                          <div className="py-4 pl-4">
                                            <div className="w-[100px] text-left">Tokens</div>
                                          </div>
                                          <div className="py-4 pl-4 text-left">
                                            <div className="w-[100px] text-left">Amount</div>
                                          </div>
                                          <div className="py-4 px-4 whitespace-nowrap flex-1">
                                            <div className="w-[100px]">{optionName}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-0">
                                    <div
                                      className={`overflow-y-auto ${
                                        csvResult.length > 4 && isRemarkColumn
                                          ? 'w-[773px]'
                                          : csvResult.length > 4 && !isRemarkColumn
                                          ? 'w-[656px]'
                                          : 'w-full'
                                      } scrollbar max-h-[35vh] border-x border-b border-[#DDE2E7]`}
                                    >
                                      {csvData.length === 1 ? (
                                        <NotFound
                                          title="No Recipients Found"
                                          icon={recipientIcon}
                                          height={32}
                                          width={32}
                                          className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
                                        />
                                      ) : (
                                        <table>
                                          <tbody>
                                            {csvResult.map((item, index) => (
                                              <ReviewCSVItem
                                                remark={remark}
                                                isRemarkColumn={isRemarkColumn}
                                                csvResult={csvResult}
                                                sourceAddress={sourceAddress}
                                                token={token}
                                                tokenLogoUrl={tokenLogoUrl}
                                                correctToken={correctToken}
                                                validDecimal={validDecimal}
                                                key={`key_${Math.random()}`}
                                                fullTokenName={tokenName}
                                                item={item}
                                                addressExists={addressExists}
                                              />
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-solid border-[#EBEDEF] gap-4 flex p-8 leading-6">
                        <button
                          onClick={() => {
                            setFileCsv(null)
                            setCsvResultImport([])
                            setCsvResult([])
                            setCSVData([])
                          }}
                          className="py-4 font-semibold rounded-lg px-8 bg-[#F3F5F7]"
                          type="button"
                        >
                          Back
                        </button>
                        {csvData.length === 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFileCsv(null)
                              setCsvResultImport([])
                              setCsvResult([])
                              setCSVData([])
                            }}
                            className="py-4 text-white bg-grey-900 hover:bg-grey-901 ml-4 rounded-lg w-full font-semibold text-base leading-6"
                          >
                            Upload Another File
                          </button>
                        ) : csvResultImport.length === 0 ? (
                          <button
                            onClick={handleEndModal}
                            disabled={csvResultImport.length === 0}
                            className={`py-4 w-full rounded-lg px-8  text-white font-bold bg-grey-900 hover:bg-grey-901 ${
                              csvResultImport.length === 0 ? 'opacity-50' : ''
                            } `}
                            type="button"
                          >
                            Import {csvResultImport.length} Recipients
                          </button>
                        ) : (
                          <button
                            onClick={handleEndModal}
                            className="py-4 w-full rounded-lg px-8 bg-grey-900 hover:bg-grey-901 text-white font-bold"
                            type="button"
                          >
                            {csvResultImport.length !== 1 ? (
                              csvResultImport.length > Number(process.env.NEXT_PUBLIC_MAXIMUM_RECIPIENTS) ? (
                                <div>Import first {Number(process.env.NEXT_PUBLIC_MAXIMUM_RECIPIENTS)} Recipients</div>
                              ) : (
                                <div>Import {csvResultImport.length} Recipients</div>
                              )
                            ) : (
                              <div> Import {csvResultImport.length} Recipient</div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ) : fileCsv && fileCsv.type !== 'text/csv' ? (
                  <div className="max-w-[600px]">
                    <div>
                      <div className="flex p-8">
                        <div>
                          <div className="border w-full border-[#E93636] text-[#E93636] rounded-lg flex items-center justify-between h-14">
                            <div className="flex w-full">
                              <div className="ml-6 flex items-center">
                                <Image src={fileReject} />
                              </div>

                              <input
                                className="mx-4 my-[18px] w-full h-full outline-none font-inter"
                                type="text"
                                defaultValue={fileCsv[0] ? fileCsv[0].file.name : fileCsv ? fileCsv.name : ''}
                              />
                            </div>

                            {/* <div className="flex gap-2 mr-6">
                              <Image src={reject} />
                            </div> */}
                          </div>
                          <div className="flex items-center font-inter font-medium text-sm leading-4 text-[#E93636] gap-2 pt-2">
                            <img src="/svg/warning.svg" alt="warning" />
                            <p className="font-medium">
                              Error in file upload, please{' '}
                              <a className="underline" href="/file/LX-bulk-transfer-template.csv" download>
                                download the sample .CSV
                              </a>{' '}
                              file to ensure you're using the right structure
                            </p>
                          </div>
                        </div>
                        <button
                          className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14"
                          onClick={() => {
                            setFileCsv(null)
                            setCsvResultImport([])
                            setCsvResult([])
                            setCSVData([])
                          }}
                          type="button"
                        >
                          {' '}
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

                      <div className="p-8 flex font-inter border-t border-solid border-[#EBEDEF]">
                        <button
                          onClick={() => handleCancel()}
                          className="py-4 px-8 bg-[#F3F5F7] rounded-lg text-base font-semibold leading-6"
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFileCsv(null)
                            setCsvResultImport([])
                            setCsvResult([])
                            setCSVData([])
                          }}
                          className="py-4 text-white bg-grey-900 hover:bg-grey-901 ml-4 rounded-lg w-full font-semibold text-base leading-6"
                        >
                          Upload Another File
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>

              {showError && (
                <Modal showModal={showError} setShowModal={setShowError}>
                  <ErrorPopUp
                    action={() => setShowError(false)}
                    title="Failed to import recipients"
                    description="Please recheck the recipient wallet address, token and amount of each recipient."
                  />
                </Modal>
              )}
            </div>
          ) : (
            <Modal showModal={modalEnd} setShowModal={setModalEnd}>
              <div className="bg-white rounded-lg">
                <div className="flex items-center p-8 ">
                  <div className="mr-8">
                    <Image src={fileSuccess} />
                  </div>
                  <div>
                    <p className="text-2xl leading-8 font-supply">IMPORTED SUCCESSFULLY</p>
                    <p className="text-base leading-5 font-inter tracking-wide text-[#787878] mt-1">
                      Data from your .CSV should reflect in the fields.
                    </p>
                  </div>
                </div>
                <div className="p-8 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="py-4 w-full bg-grey-900 text-white font-semibold text-base font-inter rounded-lg leading-6 hover:bg-grey-901"
                    type="button"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </Modal>
      )}
    </div>
  )
}
export default UploadCSVTransferApp
