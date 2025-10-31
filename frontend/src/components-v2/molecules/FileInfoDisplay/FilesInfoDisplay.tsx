import React, { FC } from 'react'
import Image from 'next/legacy/image'
import { toShort } from '@/utils/toShort'
import ReactTooltip from 'react-tooltip'
import Button from '@/components-v2/atoms/Button'
import DownloadIcon from '@/public/svg/Download.svg'

interface IFile {
  filename: string
  path: string
  name?: string
}

interface IFileInfoDisplayProps {
  id: string
  files: IFile[]
  onClickFile: (file: any) => void
  onDownloadFile: (file: any) => void
}

const FileInfoDisplay: FC<IFileInfoDisplayProps> = ({ files, id, onClickFile, onDownloadFile }) => {
  const handleOnClickFile = (_file) => (e) => {
    e.stopPropagation()
    onClickFile(_file)
  }
  const handleDownloadFile = (_file) => (e) => {
    e.stopPropagation()
    onDownloadFile(_file)
  }
  return (
    <div className="flex flex-row gap-2">
      {files.length > 0 && (
        <Button
          height={32}
          trailingIcon={
            <Image
              src={DownloadIcon}
              alt="external-link"
              height={14}
              width={14}
              onClick={handleDownloadFile(files[0])}
            />
          }
          onClick={handleOnClickFile(files[0])}
          variant="grey"
          label={
            files[0].name.length > 15
              ? files.length > 1
                ? toShort(files[0].name, 5, 3)
                : toShort(files[0].name, 6, 6)
              : files[0].name
          }
          classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
        />
      )}
      {files.length > 1 && (
        <>
          <Button
            height={32}
            data-tip={`full-file-info-${id}`}
            data-for={`full-file-info-${id}`}
            variant="grey"
            label={`+ ${files?.length && files.length - 1}`} // To avoid linting error no-unsafe-optional-chaining
            classNames="overflow-hidden whitespace-nowrap text-ellipsis px-2"
          />
          <ReactTooltip
            id={`full-file-info-${id}`}
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
              {files
                .filter((file, indexForFile) => indexForFile !== 0)
                .map((file, _index) => (
                  <Button
                    classNames={_index !== 0 && 'mt-2'}
                    trailingIcon={
                      <Image
                        src={DownloadIcon}
                        alt="external-link"
                        height={14}
                        width={14}
                        onClick={handleDownloadFile(file)}
                      />
                    }
                    height={32}
                    onClick={handleOnClickFile(file)}
                    variant="grey"
                    label={`${file.name}`}
                  />
                ))}
            </div>
          </ReactTooltip>
        </>
      )}
    </div>
  )
}

export default FileInfoDisplay
