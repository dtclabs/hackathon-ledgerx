/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unescaped-entities */
import Modal from '@/components/Modal'
import { IModal } from '@/components/Modal/interface'
import ErrorPopUp from '@/components/PopUp/ErrorPopUp/ErrorPopUp'
import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/legacy/image'
import fileImport from '@/public/svg/file.svg'
import fileReject from '@/public/svg/filereject.svg'
import Load from '@/public/svg/LoaderDefault.svg'
import FreeRemoveIcon from '@/assets/svg/FreeRemoveIcon.svg'
import UploadCategory from '@/components/UploadCategory/UploadCategory'
import { IPagination } from '@/api/interface'
import { ICategories } from '@/slice/categories/interfaces'
import ReviewCategory from './ReviewCategory'
import SelectOption from './SelectOption'
import warningCategory from '@/public/svg/warningCategory.svg'
import { isNumber } from '@/utils/isNumber'
import { CATEGORY_TYPES } from '@/constants/categoryTypes'
import categoryIcon from '@/public/svg/Document.svg'
import Typography from '@/components-v2/atoms/Typography'
import NotFound from '@/components/NotFound'

interface IImportCategoryModal extends IModal {
  setCSVData: (file: any) => void
  csvData: any
  categories: IPagination<ICategories>
  option: string
  setOption: (data) => void
  options: {
    key: string
    name: string
  }[]
  onSubmit: (data: any[]) => void
}

const ImportCategory: React.FC<IImportCategoryModal> = ({
  setShowModal,
  showModal,
  csvData,
  setCSVData,
  categories,
  option,
  setOption,
  options,
  onSubmit
}) => {
  const [fileCsv, setFileCsv] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileCsvError, setFileCsvError] = useState(false)

  const [showError, setShowError] = useState(false)
  const [csvResult, setCsvResult] = useState([])
  const [csvResultImport, setCsvResultImport] = useState([])
  const [codeExists, setCodeExists] = useState([])
  const [nameExists, setNameExists] = useState([])
  // const [invalidList, setInvalidList] = useState([])
  const description = csvResult && csvResult.filter((item) => item[3])
  const maxSize = process.env.NEXT_PUBLIC_FREE_APP_MAXIMUM_CATEGORIES || '100'
  useEffect(() => {
    if (csvData.length === 1) {
      setIsLoading(false)
    }
  }, [csvData.length])

  const checkValidate = useCallback(() => {
    if (csvData.length >= 1) {
      let codeColumn = null
      let typeColumn = null
      let nameColumn = null

      for (let i = 0; i < csvData.length; i++) {
        if (typeof codeColumn === 'string' && typeof typeColumn === 'string' && typeof nameColumn === 'string') {
          break
        } else {
          codeColumn = null
          typeColumn = null
          nameColumn = null
        }
      }
      if (codeColumn) {
        const temp = []
        const array1 = [0, 1, 2, 3]
        const descriptionColumn = array1.filter(
          (item) => item !== codeColumn && item !== nameColumn && item !== typeColumn
        )

        for (let i = 1; i < csvData.length; i++) {
          temp.push([])
          temp[i - 1].push(csvData[i][codeColumn])
          temp[i - 1].push(csvData[i][nameColumn])
          temp[i - 1].push(csvData[i][typeColumn])
          temp[i - 1].push(csvData[i][descriptionColumn[0]])
        }

        setCsvResult(temp)
      } else {
        const arr = []
        for (let i = 1; i < csvData.length; i++) {
          arr.push([
            csvData[i][0].trim(),
            csvData[i][1].trim(),
            csvData[i][2].trim(),
            csvData[i][3] && csvData[i][3].trim(),
            i
          ])
        }
        setCsvResult(arr)
      }
    }
  }, [csvData])

  useEffect(() => {
    if (csvData.length !== 0) checkValidate()
  }, [csvData, checkValidate])

  useEffect(() => {
    const callBack = async () => {
      const arr = []
      if (csvResult) {
        const { length } = csvResult

        for (let i = 0; i < length; i++) {
          if (categories) {
            if (option === 'Append to existing category list') {
              if (!categories.items.find((item) => item.code === csvResult[i][0] || item.name === csvResult[i][1])) {
                if (CATEGORY_TYPES && CATEGORY_TYPES.find((item) => item.type === csvResult[i][2])) {
                  const code =
                    csvResult[i] &&
                    /^[0-9]+$/i.test(csvResult[i] && csvResult[i][0]) &&
                    /^\d+$/.test(csvResult[i] && csvResult[i][0]) &&
                    csvResult[i][0].length < 50 &&
                    csvResult[i][0]
                  const type = csvResult[i] && csvResult[i][2] && csvResult[i][2]

                  const name = csvResult[i] && csvResult[i][1] && csvResult[i][1].length < 250 && csvResult[i][1]
                  if (code && type && name) {
                    arr.push(csvResult[i])
                  }
                }
              }
            } else {
              if (CATEGORY_TYPES && CATEGORY_TYPES.find((item) => item.type === csvResult[i][2])) {
                const code =
                  csvResult[i] &&
                  /^[0-9]+$/i.test(csvResult[i] && csvResult[i][0]) &&
                  /^\d+$/.test(csvResult[i] && csvResult[i][0]) &&
                  csvResult[i][0].length < 50 &&
                  csvResult[i][0]
                const type = csvResult[i] && csvResult[i][2] && csvResult[i][2]
                const name = csvResult[i] && csvResult[i][1] && csvResult[i][1].length < 250 && csvResult[i][1]
                if (code && type && name) {
                  arr.push(csvResult[i])
                }
              }
            }
          }
        }

        if (arr.filter((data) => data[3] && data[3]).length !== 0) {
          const res = arr.reduce((prev, curr) => {
            if (!prev.find((item) => item[0] === curr[0] || item[1] === curr[1]) && curr[3].length < 1000) {
              prev.push(curr)
            }
            return prev
          }, [])
          setCsvResultImport(res)
        } else if (arr.filter((data) => data[3] && data[3]).length === 0) {
          const res = arr.reduce((prev, curr) => {
            if (!prev.find((item) => item[0] === curr[0] || item[1] === curr[1])) {
              prev.push(curr)
            }
            return prev
          }, [])

          setCsvResultImport(res)
        }

        const newCodeExists = []

        for (let i = 0; i < csvResult.length; i++) {
          for (let j = i + 1; j < csvResult.length; j++) {
            if (csvResult[i][0] === csvResult[j][0]) {
              newCodeExists.push({ code: csvResult[j][0], id: csvResult[j][4] })
            }
          }
        }
        const newNameExists = []

        for (let i = 0; i < csvResult.length; i++) {
          for (let j = i + 1; j < csvResult.length; j++) {
            if (csvResult[i][1] === csvResult[j][1]) {
              newNameExists.push({ name: csvResult[j][1], id: csvResult[j][4] })
            }
          }
        }

        setCodeExists(newCodeExists)
        setNameExists(newNameExists)

        setIsLoading(false)
      }
    }

    if (csvResult && csvResult.length) callBack()
  }, [categories, csvResult, option])

  const handleCancel = () => {
    setShowModal(false)
    setOption(options[0].name)
    setFileCsv(null)
    setCsvResultImport([])
    setCsvResult([])
    setCSVData([])
  }

  const handleEndModal = () => {
    if (csvResultImport.length <= Number(maxSize)) {
      onSubmit(csvResultImport)
    } else {
      onSubmit(csvResultImport.slice(0, Number(maxSize)))
    }
    setShowModal(false)
  }

  useEffect(() => {
    if (!showModal) {
      setFileCsv(null)
      setOption(options[0].name)
      setCsvResultImport([])
      setCsvResult([])
      setCSVData([])
    }
  }, [options, setCSVData, setOption, showModal])

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <div className="w-[740px] bg-white rounded-2xl shadow-home-modal font-inter">
        <div className="bg-white shadow-free-modal rounded-3xl">
          <div className="flex justify-between items-center  p-8 border-b border-[#EBEDEF]">
            <div className="flex flex-col">
              <Typography variant="heading2" color="black" classNames="left-8 pb-2">
                Import Categories (.CSV)
              </Typography>
              <p className="text-[#667085] text-sm">This adds multiple categories at the same time.</p>
            </div>
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
                  <div className="flex mt-1 text-sm  items-center">
                    <p className=" leading-6 ">
                      Upload a .csv file with 4 columns Code, Name, Type and a Description column that is optional.{' '}
                      <a
                        href="/file/category.csv"
                        download
                        className=" text-neutral-900 leading-5 tracking-wide underline"
                      >
                        Download sample .CSV file
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="pb-1">
                <div className="mx-8 mb-8 border border-dashed border-gray-10 rounded-lg ">
                  <div className="">
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
              <div className="max-w-[740px]">
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
                          <a className="underline" href="/file/category.csv" download>
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
                <div className=" p-8">
                  <div className="text-[#344054] pb-4 text-sm">Import Location</div>
                  <div className="">
                    <SelectOption option={option} setOption={setOption} optionList={options} />
                  </div>
                  {option === 'Replace current category list' && (
                    <div className="flex items-center gap-2">
                      <Image src={warningCategory} />
                      <div className="text-[#E9740B] text-xs pt-1 leading-6">
                        You are replacing the current categories with the categories from CSV. This operation cannot be
                        undone.
                      </div>
                    </div>
                  )}
                </div>
                {/* <a className="pl-8 text-base text-neutral-900 underline" href="/">
                        Check out our full version
                      </a> */}
                <div className="px-8  pb-4 text-right text-neutral-900 text-base leading-6 tracking-wide">
                  {csvData.length === 1 ? (
                    <p className="whitespace-nowrap text-[#344054] text-sm">
                      No category detected. Please upload file again.
                    </p>
                  ) : (
                    <div className="flex flex-col justify-end ">
                      <div className="whitespace-nowrap text-[#344054] text-sm">
                        <p className="pl-1">
                          {csvResultImport.length > Number(maxSize) ? Number(maxSize) : csvResultImport.length}/{' '}
                          {csvData.length - 1} categories can be imported from this file
                        </p>{' '}
                      </div>
                      <p
                        className={`${
                          csvResultImport.length > Number(maxSize) ? 'text-red-400 underline' : 'text-[#777675]'
                        }  text-xs leading-6 italic`}
                      >
                        {`The free version supports only upto ${Number(maxSize)} lines.`}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mx-8 mb-8 text-sm  leading-4 rounded-lg">
                  <div className=" rounded-lg ">
                    <div>
                      <table className=" rounded-lg w-full ">
                        <thead>
                          <tr>
                            <th className="p-0">
                              <div className="w-full text-xs   bg-[#F8F9FA] rounded-tl-lg rounded-tr-lg border-x border-t border-[#DDE2E7] ">
                                <div>
                                  <div className="flex  text-[#667085]">
                                    <div className="py-4 pl-4 text-left ">
                                      <div className="w-[70px]">Code</div>
                                    </div>
                                    <div className="w-[216px] pl-4 py-4  text-[#667085] text-left ">
                                      <div className="w-[200px] text-left">Name</div>
                                    </div>
                                    <div className="w-[136px]  pl-4 py-4 text-[#667085] ">
                                      <div className="w-[100px] text-left">Type</div>
                                    </div>
                                    <div className="py-4 pl-4 text-[#667085] whitespace-nowrap text-left ">
                                      <div className="w-[218px]">Description</div>
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
                              <div className="overflow-y-auto w-full max-h-[35vh] scrollbar  border-x border-b border-[#DDE2E7]">
                                {csvData.length === 1 ? (
                                  <NotFound
                                    title="No Categories Found"
                                    icon={categoryIcon}
                                    height={32}
                                    width={32}
                                    className="bg-grey-200  text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
                                  />
                                ) : (
                                  <table>
                                    <tbody>
                                      {csvResult.map((item, index) => (
                                        <ReviewCategory
                                          invalidList={csvResultImport}
                                          nameExists={nameExists}
                                          codeExists={codeExists}
                                          option={option}
                                          categories={categories}
                                          description={description}
                                          index={index}
                                          item={item}
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
                      setOption(options[0].name)

                      setFileCsv(null)
                      setCsvResultImport([])
                      setCsvResult([])
                      setCSVData([])
                    }}
                    className="py-4 font-semibold rounded-lg px-8 bg-[#F3F5F7]"
                    type="button"
                  >
                    Cancel
                  </button>

                  {csvResultImport.length > Number(maxSize) ? (
                    <button
                      type="button"
                      onClick={handleEndModal}
                      className="py-4 text-white bg-grey-900 hover:bg-grey-901 ml-4 rounded-lg w-full font-semibold text-base leading-6"
                    >
                      {`Import ${Number(maxSize)} Categories`}
                    </button>
                  ) : csvData.length === 1 ? (
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
                      className={`py-4 w-full rounded-lg px-8  text-white font-bold bg-grey-900  ${
                        csvResultImport.length === 0 ? 'opacity-50' : 'hover:bg-grey-901'
                      } `}
                      type="button"
                    >
                      Import {csvResultImport.length} Categories
                    </button>
                  ) : (
                    <button
                      disabled={csvResultImport.length === 0}
                      onClick={handleEndModal}
                      className={`py-4 w-full rounded-lg px-8  text-white font-bold bg-grey-900  ${
                        csvResultImport.length === 0 ? 'opacity-50' : 'hover:bg-grey-901'
                      } `}
                      type="button"
                    >
                      {csvResultImport.length !== 1 ? (
                        <div>Import {csvResultImport.length} Categories </div>
                      ) : (
                        <div> Import {csvResultImport.length} Category</div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          ) : fileCsv && fileCsv.type !== 'text/csv' ? (
            <div className="max-w-[740px]">
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
                        <a className="underline" href="/file/category.csv" download>
                          download the sample .CSV
                        </a>{' '}
                        file to ensure you're using the right structure
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14"
                    onClick={() => setFileCsv(null)}
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
              title="Failed to import Categories"
              description="Please recheck the code, name, type and description of each category."
            />
          </Modal>
        )}
      </div>
    </Modal>
  )
}

export default ImportCategory
