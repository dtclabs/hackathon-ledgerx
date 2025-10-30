/* eslint-disable arrow-body-style */
import React, { FC, useState } from 'react'

import Image from 'next/legacy/image'
import Delete from '@/public/svg/TrashRed.svg'
import DownloadIcon from '@/public/svg/Download.svg'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'

interface IFileItemProps {
  file: any
  onClick: any
  onRemove: any
  onDownload: any
  selectedFile: any
  setSelectedFile: any
  isDownloading: boolean
}

const FileItem: FC<IFileItemProps> = ({
  file,
  onRemove,
  selectedFile,
  isDownloading,
  setSelectedFile,
  onDownload,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)
  const [isDownloadHovered, setIsDownloadHovered] = useState(false)

  const handleOnClickDelete = (e) => {
    e.stopPropagation()
    onRemove(file)
  }

  const handleOnClickDownload = (e) => {
    e.stopPropagation()
    setSelectedFile(file)
    onDownload(file)
  }

  const handleOnClickButton = () => {
    onClick(file)
  }

  return (
    <div>
      <button
        type="button"
        key={file.id}
        data-tip={`file-tooltip-${file.id}`}
        data-for={`file-tooltip-${file.id}`}
        id={`file-tooltip-${file.id}`}
        className="w-full flex items-center justify-between px-3 py-2 border rounded hover:bg-grey-200 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={handleOnClickButton}
        disabled={selectedFile && selectedFile?.id === file.id && isDownloading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Typography color="dark" variant="caption" classNames="truncate">
          {file.name}
        </Typography>
        <div className="shrink-0 flex py-1 gap-2">
          <Image
            src={DownloadIcon}
            alt="download-file"
            width={14}
            height={14}
            onClick={handleOnClickDownload}
            onMouseEnter={() => setIsDownloadHovered(true)}
            onMouseLeave={() => setIsDownloadHovered(false)}
          />
          <Image
            src={Delete}
            alt="delete-file"
            width={14}
            height={14}
            onClick={handleOnClickDelete}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
          />
        </div>
      </button>
      <ReactTooltip
        id={`file-tooltip-${file.id}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        className="!opacity-100 !rounded-lg"
      >
        <Typography variant="caption" color="secondary">
          {isDeleteHovered
            ? 'Click to delete'
            : isDownloadHovered
            ? 'Click to download'
            : isHovered
            ? 'Click to preview'
            : ''}
        </Typography>
      </ReactTooltip>
    </div>
  )
}

export default FileItem
