/* eslint-disable react/no-array-index-key */
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Close from '@/public/svg/CloseGray.svg'
import DownloadIcon from '@/public/svg/Download.svg'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import ErrorMessage from '@/views/MakePayment2/components/ErrorMessage'
import Image from 'next/legacy/image'
import { FC, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'

interface ILineItemFileUpload {
  files: any[]
  index?: number
  onChangeFile: (file, index: number, action: 'add' | 'remove') => void
  disabled?: boolean
  errors?: any
  onDownload?: (file) => void
  onPreview: (file) => void
}

// Move this to a file helper
function validateFile(file, maxSizeInMB, allowedExtensions) {
  const sizeInMB = file.size / (1024 * 1024) // Convert bytes to megabytes
  const extension = file.name.split('.').pop().toLowerCase()

  let error = ''
  let errorType = ''
  if (sizeInMB > maxSizeInMB) {
    error = `File size is too big. Select a file less than ${maxSizeInMB} MB.`
    errorType = 'size'
  } else if (!allowedExtensions.includes(extension)) {
    error = `.${extension} is not supported.`
    errorType = 'disallowedExtension'
  }

  return {
    isValid: error === '',
    error,
    errorType
  }
}

const maxSizeInMB = 2
const allowedExtensions = [
  'jpg',
  'png',
  'csv',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'pages',
  'numbers',
  'jpg',
  'jpeg',
  'gif',
  'tif'
]

// For Firefox
const allowedMIMETypes = [
  'image/jpeg', // jpg
  'image/png', // png
  'text/csv', // csv
  'application/pdf', // pdf
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.apple.pages', // pages
  'application/vnd.apple.numbers', // numbers
  'image/jpeg', // jpeg
  'image/gif', // gif
  'image/tiff' // tif
]

const PaymentFileUpload: FC<ILineItemFileUpload> = ({
  index,
  files,
  onChangeFile,
  onPreview,
  onDownload,
  disabled,
  errors
}) => {
  const fileInputRef = useRef(null)
  const [fileUploadError, setFileUploadError] = useState('')
  const [fileUploadErrorType, setFileUploadErrorType] = useState('')

  const handleButtonClick = () => {
    setFileUploadError('')
    setFileUploadErrorType('')
    fileInputRef.current.click()
  }

  const handleFileChange = async (event) => {
    const { files: filesToUpload } = event.target
    for (const file of filesToUpload) {
      const { isValid, error, errorType } = validateFile(file, maxSizeInMB, allowedExtensions)
      if (!isValid) {
        console.error(error)
        setFileUploadError(error)
        setFileUploadErrorType(errorType)
        // Handle the error as needed in your application
      } else {
        onChangeFile(file, index, 'add')
        // Add your file handling logic here for valid files
      }
    }
  }

  const handleRemoveFile = (_file) => {
    onChangeFile(_file, index, 'remove')
  }

  return (
    <div className="flex flex-row flex-wrap items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        // limit supported when selecting file
        accept={[...allowedExtensions.map((item) => `.${item}`), ...allowedMIMETypes].join(', ')}
      />
      {files?.length > 0 && (
        <>
          <Button
            data-tip={`extra-items-payment-${index}`}
            data-for={`extra-items-payment-${index}`}
            classNames="ml-2 !border-blanca-300"
            variant="grey"
            height={32}
            leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
            label={`${files.length} ${files.length > 1 ? 'files' : 'file'}`}
          />
          <ReactTooltip
            id={`extra-items-payment-${index}`}
            borderColor="#eaeaec"
            border
            delayHide={500}
            delayShow={250}
            delayUpdate={500}
            place="bottom"
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            <div className="pt-2 pb-2">
              {files.map((file, _index) => (
                <Button
                  key={_index}
                  width="w-full"
                  trailingIcon={
                    <div className="flex items-center justify-center gap-1">
                      {file?.id && (
                        <Image
                          src={DownloadIcon}
                          alt="download"
                          height={14}
                          width={14}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onDownload) onDownload(file)
                          }}
                        />
                      )}
                      {!disabled && (
                        <Image
                          src={Close}
                          alt="close"
                          height={14}
                          width={14}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(file)
                          }}
                        />
                      )}
                    </div>
                  }
                  classNames={`${_index !== 0 && 'mt-2'} gap-4 justify-between`}
                  height={32}
                  variant="grey"
                  label={`${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreview(file)
                  }}
                />
              ))}
            </div>
          </ReactTooltip>
        </>
      )}
      <div className={`mr-2 ${files?.length > 0 ? 'ml-2' : ''}`}>
        <Button
          // @ts-ignore
          disabled={disabled}
          onClick={handleButtonClick}
          type="button"
          leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
          variant="transparent"
          height={40}
          label="Attach file"
          classNames="disabled:bg-[#F2F4F7]"
        />
      </div>
      {fileUploadError && fileUploadErrorType !== 'disallowedExtension' ? (
        <ErrorMessage errorMessage={fileUploadError} />
      ) : (
        fileUploadError && (
          <div className="flex gap-2 items-center pt-2">
            <div className="flex items-center">
              <Image src={ErrorCircleIcon} alt="warning" width={12} height={12} />
            </div>
            <div className="flex gap-1">
              <Typography classNames="!text-[#C61616]" variant="caption">
                {fileUploadError}
              </Typography>
              <Typography
                classNames="!text-[#C61616] underline"
                variant="caption"
                data-tip="allowed-extensions"
                data-for="allowed-extensions"
              >
                Supported File formats.
              </Typography>
              <ReactTooltip
                id="allowed-extensions"
                borderColor="#eaeaec"
                border
                place="bottom"
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
              >
                <div className="pt-2 pb-2">{allowedExtensions.join(', ')}</div>
              </ReactTooltip>
            </div>
          </div>
        )
      )}
      {!fileUploadError && errors && <ErrorMessage errorMessage={errors} />}
    </div>
  )
}

export default PaymentFileUpload
