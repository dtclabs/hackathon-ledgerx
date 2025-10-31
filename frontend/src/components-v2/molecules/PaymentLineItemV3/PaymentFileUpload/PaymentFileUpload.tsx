/* eslint-disable react/no-array-index-key */
import Button from '@/components-v2/atoms/Button'
import Close from '@/public/svg/CloseGray.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import DownloadIcon from '@/public/svg/Download.svg'
import Image from 'next/legacy/image'
import { FC, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import ErrorCircleIcon from '@/public/svg/icons/error-circle-outlined-red.svg'
import Typography from '@/components-v2/atoms/Typography'
import ErrorMessage from '@/views/MakePayment2/components/ErrorMessage'
import { useLazyPreviewFileQuery, IPreviewFileRequest } from '@/api-v2/old-tx-api'

interface ILineItemFileUpload {
  files: IPreviewFileRequest[]
  index?: number
  onChangeFile: (file, index: number, action: 'add' | 'remove') => void
  disabled?: boolean
  errors?: any
  onClickPreviewFile?: (uploadedFilename) => void
  onDownloadFile?: (uploadedFilename) => void
}

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
  disabled,
  errors,
  onClickPreviewFile,
  onDownloadFile
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
    onChangeFile(filesToUpload[0], index, 'add')
  }

  const handleRemoveFile = (_file) => (e) => {
    console.log('REMOVE: ', e)
    e.stopPropagation()
    onChangeFile(_file, index, 'remove')
  }

  const handlePreviewFile = (file) => (e) => {
    console.log('PREVIEW: ', e)
    e.stopPropagation()
    onClickPreviewFile(file)
  }

  const handleDownloadFile = (file) => (e) => {
    e.stopPropagation()
    if (onDownloadFile) onDownloadFile(file)
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
                  onClick={handlePreviewFile(file)}
                  key={_index}
                  trailingIcon={
                    <div className="flex items-center justify-center gap-1">
                      <Image
                        src={DownloadIcon}
                        alt="download"
                        height={14}
                        width={14}
                        onClick={handleDownloadFile(file)}
                      />
                      {!disabled && (
                        <Image src={Close} alt="close" height={14} width={14} onClick={handleRemoveFile(file)} />
                      )}
                    </div>
                  }
                  classNames={_index !== 0 && 'mt-2'}
                  height={32}
                  variant="grey"
                  label={`${file.filename}`}
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
