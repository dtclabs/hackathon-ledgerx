/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-shadow */
import { FC, useEffect, useRef, useState } from 'react'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import Close from '@/public/svg/CloseGray.svg'
import AttachFileIcon from '@/public/svg/paperclip.svg'
import Button from '@/components-v2/atoms/Button'
import { useUploadTxFileMutation } from '@/api-v2/old-tx-api'
import { toShort } from '@/utils/toShort'
import ErrorMessage from '../ErrorMessage'
import warning from '@/public/svg/icons/warning-round-red.svg'
import Typography from '@/components-v2/atoms/Typography'

interface ILineItemFileUpload {
  control: any
  files: any
  index: number
  setValue: any
  getValues: any
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
  'png',
  'gif',
  'tif'
]

const RecipientFileUpload: FC<ILineItemFileUpload> = ({ control, index, setValue, files, getValues }) => {
  const fileInputRef = useRef(null)
  const [fileUploadError, setFileUploadError] = useState('')
  const [fileUploadErrorType, setFileUploadErrorType] = useState('')
  const [uploadFile, uploadFileRes] = useUploadTxFileMutation()

  const handleButtonClick = () => {
    setFileUploadError('')
    setFileUploadErrorType('')
    fileInputRef.current.click()
  }

  // useEffect(() => {
  //   console.log('These are the uploaded files! ', uploadFileRes)
  //   console.log('These are the details for the recipients!', getValues('recipients'))
  //   const recipientData = getValues('recipients')[index].files.filter(file => file.name === )
  //   // setValue(`recipients.${index}.files`, [...files, {...}])
  // }, [uploadFileRes?.data?.data])

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
        setValue(`recipients.${index}.files`, [...files, file])
        // Add your file handling logic here for valid files
      }
    }

    // TODO- PENDING This step should be when clicking review payment so files are uploaded only after
    // hittin submit
    // const formData = new FormData()
    // formData.append('files', filesToUpload[0])

    // await uploadFile({ files: formData }).unwrap()
  }

  const handleRemoveFile = (_file) => () => {
    const filteredFiles = files.filter((file) => file.name !== _file.name)
    setValue(`recipients.${index}.files`, filteredFiles)
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-wrap gap-2 items-center">
        {files.length > 0 && (
          <>
            <Button
              data-tip={`extra-items-payment-${index}`}
              data-for={`extra-items-payment-${index}`}
              leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
              classNames="ml-2"
              variant="grey"
              height={40}
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
                    trailingIcon={
                      <Image src={Close} alt="close" height={14} width={14} onClick={handleRemoveFile(file)} />
                    }
                    classNames={_index !== 0 && 'mt-2'}
                    height={40}
                    variant="grey"
                    label={`${file.name}`}
                  />
                ))}
              </div>
            </ReactTooltip>
          </>
        )}
        <Button
          // @ts-ignore
          onClick={handleButtonClick}
          type="button"
          leadingIcon={<Image src={AttachFileIcon} alt="attach-icon" height={14} width={14} />}
          variant="transparent"
          height={40}
          label="Attach file"
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {/* <div className="ml-2 flex flex-row">
          {files.length > 0 && (
            <Button
              trailingIcon={
                <Image src={Close} alt="close" height={14} width={14} onClick={handleRemoveFile(files[0])} />
              }
              key={files[0].name}
              type="button"
              variant="grey"
              height={40}
              label={files[0].name.length > 30 ? toShort(files[0].name, 6, 6) : files[0].name}
            />
          )}
          {files.length > 1 && (
            <>
              <Button
                data-tip={`extra-items-payment-${index}`}
                data-for={`extra-items-payment-${index}`}
                classNames="ml-2"
                variant="grey"
                height={40}
                label={`+${files.length - 1}`}
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
                  {files.map((file, _index) => {
                    // Skip the first item
                    if (_index === 0) return null
                    return (
                      <Button
                        trailingIcon={
                          <Image src={Close} alt="close" height={14} width={14} onClick={handleRemoveFile(file)} />
                        }
                        classNames={_index !== 0 && 'mt-2'}
                        height={40}
                        variant="grey"
                        label={`${file.name}`}
                      />
                    )
                  })}
                </div>
              </ReactTooltip>
            </>
          )}
        </div> */}
      </div>
      {fileUploadError && fileUploadErrorType !== 'disallowedExtension' ? (
        <ErrorMessage errorMessage={fileUploadError} />
      ) : (
        fileUploadError && (
          <div className="flex gap-2 items-center pt-2">
            <div className="flex items-center">
              <Image src={warning} alt="warning" width={12} height={12} />
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
    </div>
  )
}

export default RecipientFileUpload
