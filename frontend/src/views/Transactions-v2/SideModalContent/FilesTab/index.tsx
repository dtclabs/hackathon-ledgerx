/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useState, useEffect } from 'react'
import {
  IFiles,
  useDeleteFileMutation,
  useLazyDownloadFileQuery,
  useLazyPreviewFileTabQuery,
  useUpdateFinancialTransactionMutation,
  useUploadFileMutation
} from '@/api-v2/financial-tx-api'
import Image from 'next/legacy/image'
import Delete from '@/public/svg/TrashRed.svg'
import { Button } from '@/components-v2'
import warning from '@/public/svg/light-warning-icon.svg'
import Loader from '@/public/svg/darkLoader.svg'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { Divider } from '@/components-v2/Divider'
import TextField from '@/components/TextField/TextField'
import { toast } from 'react-toastify'
import ButtonV2 from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'
import FileItem from './FileItem'

enum FILE_SIZE {
  MAX = 20
}

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'text/plain', 'text/csv']

interface IFilesTab {
  selectedItem: any
  files: IFiles[]
  resetError?: boolean
  activeTab: string
}

const FileTabs: React.FC<IFilesTab> = ({ selectedItem, files, resetError, activeTab }) => {
  const orgId = useOrganizationId()

  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState(selectedItem?.note || '')
  const [selectedFile, setSelectedFile] = useState<IFiles>()

  const fileRef = useRef<HTMLInputElement>(null)
  const onAttachFile = () => {
    setError('')
    fileRef.current.click()
  }

  useEffect(() => {
    if (selectedItem) {
      setNoteText(selectedItem?.note || '')
    }
  }, [selectedItem])

  useEffect(() => {
    if (activeTab) {
      setNoteText(selectedItem?.note || '')
    }
  }, [activeTab])

  useEffect(() => {
    if (resetError) {
      setError('')
    }
  }, [resetError])

  const [uploadFile, uploadFileRes] = useUploadFileMutation()
  const [deleteFile, deleteFileRes] = useDeleteFileMutation()
  const [triggerDownload, { isLoading: isDownloading, isFetching }] = useLazyDownloadFileQuery()
  const [triggerPreviewFile, { isLoading: isPreviewLoading }] = useLazyPreviewFileTabQuery()
  const [updateFinnacialTx, updateFinnacialTxResult] = useUpdateFinancialTransactionMutation()

  useEffect(() => {
    if (uploadFileRes.isSuccess) {
      toast.success('File uploaded')
      setError('')
    } else if (uploadFileRes.isError) {
      toast.error('File upload failed')
    }
  }, [uploadFileRes.isError, uploadFileRes.isSuccess])

  useEffect(() => {
    if (deleteFileRes.isSuccess) {
      toast.success('File deleted')
    } else if (deleteFileRes.isError) {
      toast.error('File delete failed')
    }
  }, [deleteFileRes.isError, deleteFileRes.isSuccess])

  useEffect(() => {
    if (updateFinnacialTxResult.isSuccess) {
      toast.success('Note saved')
    } else if (updateFinnacialTxResult.isError) {
      toast.error('Note save failed')
    }
  }, [updateFinnacialTxResult.isError, updateFinnacialTxResult.isSuccess])

  const handleUploadFile = (fileData) => {
    if (fileData.size / 1024 / 1024 > FILE_SIZE.MAX) {
      setError(`Maximum file size is ${FILE_SIZE.MAX}MB`)
    } else if (!allowedTypes.includes(fileData.type)) {
      setError('The allowed file types are CSV, PDF, DOC, TXT, JPEG, JPG, and PNG')
    } else {
      const formData = new FormData()
      formData.append('files', fileData)
      uploadFile({ orgId, id: selectedItem.id, files: formData })
    }
  }

  const handleDownLoadFile = (file) => {
    triggerDownload({ orgId, id: selectedItem.id, fileId: file.id, fileName: file.name })
  }

  const handlePreviewFile = (file) => {
    triggerPreviewFile({ orgId, id: selectedItem.id, fileId: file.id, fileName: file.name })
  }

  const handleDeleteFile = (fileData) => {
    deleteFile({ orgId, id: selectedItem.id, fileId: fileData.id })
  }

  const handleSave = () => {
    updateFinnacialTx({
      orgId,
      id: selectedItem.id,
      payload: {
        note: noteText
      }
    })
  }

  return (
    <div className="font-inter mt-6">
      <Typography styleVariant="semibold" color="dark" variant="body1">
        Files
      </Typography>
      <div className="mt-4 mb-6">
        {files?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <FileItem
                file={file}
                onClick={handlePreviewFile}
                onDownload={handleDownLoadFile}
                selectedFile={selectedFile}
                onRemove={handleDeleteFile}
                setSelectedFile={setSelectedFile}
                isDownloading={isDownloading}
              />
            ))}
          </div>
        ) : (
          !uploadFileRes.isLoading && (
            <Typography variant="body2" classNames="text-dashboard-sub">
              No files attached
            </Typography>
          )
        )}
        {uploadFileRes.isLoading && (
          <div className="w-full bg-gray-100 flex items-center gap-3 px-3 py-2 border rounded mt-2">
            <Image src={Loader} alt="Load" width={20} height={20} className="animate-spin" />
            <Typography variant="caption" color="dark">
              Updating...
            </Typography>
          </div>
        )}
      </div>
      <div className="">
        <Button variant="outlined" onClick={onAttachFile} className="flex items-center gap-[10px]">
          <Typography styleVariant="medium" variant="caption">
            Attach a file
          </Typography>
          <img src="/svg/paperclip.svg" alt="upload" width={12} height={12} />
        </Button>
        <input
          type="file"
          className="hidden"
          value=""
          ref={fileRef}
          onChange={(e) => {
            e.stopPropagation()
            handleUploadFile(e.target.files[0])
          }}
        />
        {error && (
          <Typography classNames="mt-1 mx-1 flex items-center" color="error" variant="caption">
            <div className="mr-2 flex items-center">
              <Image src={warning} alt="warning" width={11} height={11} />
            </div>
            {error}
          </Typography>
        )}
      </div>
      <Divider />
      <div className="flex items-center justify-between mb-4">
        <Typography color="dark" classNames="p-2 pl-0" styleVariant="semibold" variant="body1">
          Note
        </Typography>
        <ButtonV2
          height={24}
          variant="whiteWithBlackBorder"
          label="Save"
          classNames="!text-xs"
          onClick={() => {
            handleSave()
          }}
        />
      </div>
      <TextField
        name="notes"
        value={noteText}
        onChangeTextArea={(e) => {
          setNoteText(e.target.value)
        }}
        multiline
        rows={4}
        classNameInput="focus:outline-none scrollbar border border-[#EAECF0] p-2 py-4text-sm text-dash placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter rounded-lg disabled:bg-transparent focus:shadow-textFieldRecipient"
      />
    </div>
  )
}

export default FileTabs
