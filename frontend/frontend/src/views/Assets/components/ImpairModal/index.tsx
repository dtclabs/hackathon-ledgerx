import { Button } from '@/components-v2'
import { DateTimePicker } from '@/components-v2/DateTimePicker'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Modal from '@/components/Modal'
import TextField from '@/components/TextField/TextField'
import React, { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import Decrease from '@/public/svg/Decrease.svg'
import ReviewTaxLots from '../ReviewTaxLots'

const data = [
  {
    lotId: 'ETH-1',
    amount: 0.5,
    price: 1754.56
  }
]

interface IImpairModal {
  title: 'Impair' | 'Revalue'
  asset: string
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  showTimeSelect?: boolean
}

interface IImpairForm {
  date: any
  price: string
  loss: string
}

const ImpairModal: React.FC<IImpairModal> = ({ title, asset, setShowModal, showModal, showTimeSelect }) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue
  } = useForm<IImpairForm>({
    defaultValues: {
      date: new Date(),
      price: '',
      loss: ''
    }
  })
  const inputDate = useWatch({ control, name: 'date' })
  const newPrice = useWatch({ control, name: 'price' })

  const [totalLoss, setTotalLoss] = useState(0)
  const handleSelectDate = (selectedDate: Date) => {
    setValue('date', selectedDate)
  }

  const onSubmit = (fomrData: IImpairForm) => {
    // console.log(data)
  }

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-[800px] rounded-2xl bg-white font-inter">
        <div className="p-8 border-b text-2xl font-semibold leading-8 text-neutral-900">{title}</div>
        <div className="p-8">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="mb-2 text-sm text-neutral-900 font-medium leading-5">New Price Date and Time</div>
              <DateTimePicker
                confirmable
                onSubmit={handleSelectDate}
                inputDate={inputDate}
                showTimeSelect={!!showTimeSelect}
                timeIntervals={showTimeSelect && 15}
              />
            </div>
            <div className="flex-1">
              <div className="mb-2 text-sm text-neutral-900 font-medium leading-5">New Price Per Asset</div>
              <div className="flex items-center border-[#EAECF0] border rounded w-full bg-white h-10">
                <TextField
                  control={control}
                  placeholder="Enter price"
                  name="price"
                  classNameInput="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter px-[14px] py-[10px]"
                  rules={{
                    required: { value: true, message: 'New Price is required.' }
                  }}
                />
                <DividerVertical />
                <p className="pr-4">USD</p>
              </div>
              {errors?.price?.message && (
                <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D] mt-1">
                  <div className="mr-2 flex items-center">
                    <Image src={warning} alt="warning" />
                  </div>
                  {errors?.price?.message.toString()}
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <div className="mb-2 text-sm text-neutral-900 font-medium leading-5">Review Tax Lots</div>
            {newPrice && !Number.isNaN(Number(newPrice)) && data && data.length > 0 ? (
              <ReviewTaxLots
                data={data}
                asset={asset}
                newPrice={Number(newPrice)}
                setTotalLoss={setTotalLoss}
                loss={title === 'Impair' ? 'Impairment Loss' : 'Unrealised Gain/Loss'}
              />
            ) : (
              <div className="border rounded w-full bg-transparent text-xs text-neutral-900 px-4 py-3">
                Enter the price to view the tax lots that will be impacted in this{' '}
                {title === 'Impair' ? 'impairment' : 'revaluation'}.
              </div>
            )}
          </div>
          <div className="mt-8">
            <div className="mb-2 text-neutral-900 font-medium flex items-center gap-3">
              <div className="text-sm leading-5">
                {title === 'Impair' ? 'Impairment Loss' : 'Total Unrealised Gain/Loss'}:
              </div>
              <div className="text-xs leading-[18px] text-[#C61616]">
                {newPrice && !Number.isNaN(Number(newPrice)) && totalLoss > 0 ? (
                  <div className="flex items-center gap-1">
                    <Image src={Decrease} width={12} height={12} />
                    <div>{totalLoss} USD</div>
                  </div>
                ) : (
                  <div className="text-neutral-900">-</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 border-t flex items-center gap-2">
          <Button size="lg" color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            disabled={!newPrice || Number.isNaN(Number(newPrice))}
            type="submit"
            size="lg"
            fullWidth
            color="primary"
          >
            Execute {title === 'Impair' ? 'Impairment' : 'Revaluation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ImpairModal
