import { FC } from 'react'
import Image from 'next/legacy/image'
import { useCSVReader } from 'react-papaparse'
import fileImport from '@/public/svg/fileImport.svg'

interface IUploadComponentProps {
  handleOnFileLoad: any
  handleOnFileRejected: any
}

const UploadComponent: FC<IUploadComponentProps> = ({ handleOnFileLoad, handleOnFileRejected }) => {
  const { CSVReader } = useCSVReader()
  return (
    <CSVReader
      onUploadAccepted={handleOnFileLoad}
      onUploadRejected={(file: any) => {
        handleOnFileRejected(file)
      }}
    >
      {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, isDragActive }) => (
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center border border-dashed border-gray-10 rounded-lg p-8 cursor-pointer bg-[#FBFAFA] h-full"
        >
          <div className="bg-gray-1200 p-6 h-20 w-20 rounded-full cursor-pointer hover:bg-gray-10">
            <Image src={fileImport} />
          </div>
          <p className="pt-6 font-semibold text-base leading-6">Drag and drop a .CSV file here</p>
          <p className="py-4 text-[#A4A7AA] font-medium text-sm leading-4">or</p>

          <button
            className="bg-gray-1200 py-4 px-8 rounded-lg text-base left-6 font-semibold hover:bg-gray-10 cursor-pointer"
            id="sendFile"
            type="button"
          >
            Browse computer
          </button>
          <div className="mt-4">
            <ProgressBar />
          </div>
        </div>
      )}
    </CSVReader>
  )
}
export default UploadComponent
