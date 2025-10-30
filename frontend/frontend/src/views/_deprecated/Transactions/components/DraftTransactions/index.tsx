import dot from '@/assets/svg/search.svg'
import shareDark from '@/public/svg/ShareDark.svg'
import PaginateTransactions from '@/components/PaginateTransactions'
import TextField from '@/components/TextField/TextField'
import Image from 'next/legacy/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IDraftTransactions } from '../../interface'
import DraftTransactionsItem from './DraftTransactionsItem'
import person from '@/public/svg/Person.svg'
import addPerson from '@/public/svg/AddPerson.svg'

const DraftTransactions: React.FC<IDraftTransactions> = ({ dataDraft, loading }) => {
  // Hooks
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false)
  // Custom hooks and contextAPI
  const { control } = useForm()
  // Handle event
  const handleOnClick = () => {
    // do something
  }

  // Handle logic

  return (
    <div className="bg-white rounded-2xl mt-8 font-inter text-base px-8 pb-4">
      <div className="flex justify-between items-center">
        <div className="flex rounded-lg bg-transparent border border-[#D0D5DD] justify-center pl-[18px] w-[32%]">
          <div className="flex items-center">
            <Image src={dot} width={12} height={12} />
          </div>
          <TextField
            name="SearchTransactionsOutgoing"
            control={control}
            placeholder="Search"
            classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter flex items-center px-[14px] py-[10px]"
          />
        </div>
        {/* <div className="flex items-center ">
          <div className="h-4" />
          <PaginateTransactions page={1} numberPerPage={20} totalItems={180} />
        </div> */}
      </div>
      <div className="mt-4">
        {dataDraft?.map((item) => (
          <DraftTransactionsItem key={item.blockNumber} icon={addPerson} />
        ))}
      </div>
    </div>
  )
}

export default DraftTransactions
