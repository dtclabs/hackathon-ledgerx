import Modal from '@/components/Modal'
import { IModal } from '@/components/Modal/interface'
import Image from 'next/legacy/image'
import React from 'react'
// import Welcome from '@/public/svg/Welcome.svg'
// import Book from '@/public/svg/Book.svg'
// import Payout from '@/public/svg/Payout.svg'
import { Button } from '@/components-v2/Button'
// import Welcome from '@/public/svg/Welcome.svg'
// import Book from '@/public/svg/Book.svg'
// import Payout from '@/public/svg/Payout.svg'

import { showWelcome } from '@/state/user/actions'
import { useAppDispatch } from '@/state'
import { useRouter } from 'next/router'

interface IWelcomeModal extends IModal {
  role?: string
  firstName: string
  lastName: string
  orgName: string
  organizationId?: string
}

const WelcomeModal: React.FC<IWelcomeModal> = ({
  role = 'Admin',
  firstName,
  lastName,
  orgName,
  organizationId,
  setShowModal,
  showModal
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleAddWallet = () => {
    router.push({
      pathname: `/${organizationId}/wallets`
    })
  }

  const handleMakeTranfer = () => {
    router.push({
      pathname: `/${organizationId}/transfer`
    })
  }
  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="w-[800px] bg-white font-inter text-center rounded-3xl p-10 relative">
        {/* <Image src={Welcome} /> */}

        <button
          type="button"
          onClick={() => {
            setShowModal(false)
            dispatch(showWelcome(false))
          }}
          className="bg-[#F3F5F7] p-3 rounded-full h-10 w-10 flex items-center justify-center absolute top-8 right-8"
        >
          <img src="/image/Close.png" alt="Close" className="w-3 h-3" />
        </button>
        <div className="flex justify-center">
          <img src="/svg/icons/confetti-icon.svg" alt="confetti" />
        </div>
        <p className="text-neutral-900 text-[32px] l  eading-[48px] font-bold mt-6">
          Welcome {firstName} {lastName}!
        </p>
        {role === 'Employee' && (
          <>
            <p className="text-neutral-900 text-xl leading-7 font-medium mt-2">
              We’re glad to have you join {orgName}.
            </p>
            <p className="text-neutral-900 text-xl leading-7 font-medium my-8">Ready to receive your first payment?</p>
            <Button
              size="xl"
              onClick={() => {
                setShowModal(false)
                dispatch(showWelcome(false))
              }}
            >
              Complete Profile Now
            </Button>
          </>
        )}
        {role === 'Admin' && (
          <>
            <p className="text-neutral-900 text-xl leading-7 font-medium mt-8">How can we help you today?</p>
            <div className="flex gap-8 mt-8">
              <div className="bg-neutral-100 p-6 flex-1 rounded-[14px] flex flex-col">
                <Image src="/svg/icons/book-icon.svg" height={50} width={50} />

                <p className="text-[#1D2939] text-xl font-bold leading-7 mt-6">Book-keeping</p>
                <ul className="mt-6 text-left list-disc pl-6 text-sm leading-5 text-[#475467] flex-1">
                  <li className="mt-2">
                    Add multiple wallets and start tracking your transactions (Metamask and Safe supported*)
                  </li>
                  <li className="mt-2">Tag a category and add attachments for easy tracking</li>
                  <li className="mt-2">Quick CSV export for Xero and QuickBooks</li>
                </ul>
                <Button
                  size="xl"
                  onClick={() => {
                    setShowModal(false)
                    dispatch(showWelcome(false))
                    handleAddWallet()
                  }}
                  fullWidth
                  className="mt-8"
                >
                  Add a Wallet
                </Button>
              </div>
              <div className="bg-neutral-100 p-6 flex-1 rounded-[14px] flex flex-col">
                <Image src="/svg/icons/payout-icon.svg" height={50} width={50} />

                <p className="text-[#1D2939] text-xl font-bold leading-7 mt-6">Payouts</p>
                <ul className="mt-6 text-left list-disc pl-6 text-sm leading-5 text-[#475467] flex-1">
                  <li className="mt-2">Non-custodial in nature; connect your wallet to start</li>
                  <li className="mt-2">Tag a category and add attachments for easy tracking</li>
                  <li className="mt-2 jus">Make a single or bulk token transfer</li>
                </ul>
                {/* <div className="items-end"> */}
                <Button
                  size="xl"
                  onClick={() => {
                    setShowModal(false)
                    dispatch(showWelcome(false))
                    handleMakeTranfer()
                  }}
                  fullWidth
                  className="mt-8"
                >
                  Make a Transfer
                </Button>
                {/* </div> */}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default WelcomeModal
