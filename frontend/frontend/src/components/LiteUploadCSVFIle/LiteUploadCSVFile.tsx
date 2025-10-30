import Image from 'next/legacy/image'
import React, { useState } from 'react'
import { useCSVReader } from 'react-papaparse'
import fileImport from '@/public/svg/fileImport.svg'

interface IUploadCSVFile {
  data: any
  setData?: (data: any) => void
  title?: string
  setShowError: (showError: boolean) => void
  setFileCsv: (data: any) => void
  setIsLoading: (data: boolean) => void
  setFileCsvError: (data: boolean) => void
}

const LiteUploadCSVFile: React.FC<IUploadCSVFile> = ({
  setData,
  setShowError,
  setFileCsv,
  setIsLoading,
  setFileCsvError
}) => {
  const { CSVReader } = useCSVReader()

  const handleUploadAccept = (results: any, file: any) => {
    let acceptColumn: boolean

    if (
      results.data.filter((item) => !item.every((listCsv) => listCsv === '')).length === 0 ||
      results.data[0].length < 3 ||
      results.data[0].length > 5
    ) {
      acceptColumn = false
    } else {
      if (results.data[0].length === 3) {
        const acceptFirst = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][0].toLowerCase())
        const acceptSecond = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][1].toLowerCase())
        const acceptThird = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][2].toLowerCase())
        if (acceptFirst && acceptSecond && acceptThird) {
          acceptColumn = true
        }
      } else if (results.data[0].length === 4) {
        const acceptFirst = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][0].toLowerCase())
        const acceptSecond = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][1].toLowerCase())
        const acceptThird = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][2].toLowerCase())
        const acceptFourth = ['recipient wallet address', 'token', 'amount'].includes(results.data[0][3].toLowerCase())

        if (
          (!acceptFirst && acceptSecond && acceptThird && acceptFourth) ||
          (acceptFirst && !acceptSecond && acceptThird && acceptFourth) ||
          (acceptFirst && acceptSecond && !acceptThird && acceptFourth) ||
          (acceptFirst && acceptSecond && acceptThird && !acceptFourth)
        ) {
          acceptColumn = true
        }
      }
    }

    if (acceptColumn) {
      setIsLoading(true)
      setFileCsv(file)
      setShowError(false)
      setData(results.data.filter((item) => !item.every((listCsv) => listCsv === '')))
      setFileCsvError(false)
    } else {
      setIsLoading(false)
      setFileCsv(file)
      setFileCsvError(true)
    }
  }

  return (
    <CSVReader
      noClick
      onUploadAccepted={(results: any, file: any) => handleUploadAccept(results, file)}
      onUploadRejected={(file: any) => {
        setFileCsv(file)
      }}
    >
      {({ getRootProps }: any) => (
        <div {...getRootProps()} className="py-16 flex flex-col items-center font-inter">
          <CSVReader
            onUploadAccepted={(results: any, file: any) => handleUploadAccept(results, file)}
            onUploadRejected={(file: any) => {
              setFileCsv(file)
            }}
          >
            {({ getRootProps: getRootButtonProps }: any) => (
              <>
                <button {...getRootButtonProps()} id="sendFile" type="button">
                  <div className="bg-gray-1200 p-6 h-20 rounded-full cursor-pointer hover:bg-gray-10">
                    <Image src={fileImport} />
                  </div>
                </button>
                <p className="pt-6 font-semibold text-base leading-6">Drag and drop a .CSV file here</p>
                <p className="py-4 text-[#A4A7AA] font-medium text-sm leading-4">or</p>
                <button
                  {...getRootButtonProps()}
                  className="bg-gray-1200 py-4 px-8 rounded-lg text-base left-6 font-semibold hover:bg-gray-10 cursor-pointer"
                  id="sendFile"
                  type="button"
                >
                  Browse computer
                </button>
              </>
            )}
          </CSVReader>
        </div>
      )}
    </CSVReader>
  )
}

export default LiteUploadCSVFile
