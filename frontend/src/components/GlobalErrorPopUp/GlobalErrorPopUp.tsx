import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/state'
import Modal from '../Modal'
import { globalSelectors } from '@/state/global/reducer'
import { setGlobalError } from '@/state/global/actions'
import { Button } from '@/components-v2'

const GlobalErrorPopUp: React.FC = () => {
  const dispatch = useAppDispatch()
  const [showModal, setShowModal] = useState(false)
  const error = useAppSelector(globalSelectors.errorSelector)

  useEffect(() => {
    if (error) setShowModal(true)
  }, [error])

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="bg-white w-[600px] rounded-2xl shadow-free-modal font-inter">
        <div className="flex p-8 gap-8 border-b">
          <img src="/svg/warningBig.svg" alt="warning" className="w-14 h-14" />
          <div>
            <h1 className="font-semibold text-2xl text-dashboard-main whitespace-pre-line">{error}</h1>
            <div className="text-sm font-medium text-dashboard-sub whitespace-pre-line">
              {error &&
                error.includes('Prices') &&
                'There was an error fetching prices from the service provider. You may still export without the prices or try again later. Do you want to export now?'}
            </div>
          </div>
        </div>
        <div className="border-b " />

        <div className="m-8 flex gap-4">
          <Button
            size="xl"
            fullWidth
            onClick={() => {
              setShowModal(false)
              dispatch(setGlobalError(null))
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GlobalErrorPopUp
