/* eslint-disable react/no-unescaped-entities */

import Image from 'next/legacy/image'
import fileReject from '@/public/svg/filereject.svg'
import FreeRemoveIcon from '@/assets/svg/FreeRemoveIcon.svg'
import Typography from '@/components-v2/atoms/Typography'

const CSVError = ({ fileCsv, onRemoveFile }) => (
  <>
    <div className="flex mt-8">
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
      </div>
      <button className="p-5 rounded-[9px] ml-4 bg-[#F3F5F7] h-14 w-14" onClick={onRemoveFile} type="button">
        <Image aria-hidden className="cursor-pointer" width={14} height={14} src={FreeRemoveIcon} alt="removeIcon" />
      </button>
    </div>
    <div className="flex items-center font-inter font-medium text-sm leading-4 text-[#E93636] gap-2 pt-2">
      <img src="/svg/warning.svg" alt="warning" />
      <Typography variant="body1">
        Error in file upload, please{' '}
        <a className="underline" href="/file/category.csv" download>
          download the sample .CSV
        </a>{' '}
        file to ensure you're using the right structure
      </Typography>
    </div>
  </>
)

export default CSVError
