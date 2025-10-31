import Button from '@/components-v2/atoms/Button'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import ArrowBackIcon from '@/public/svg/icons/caret-icon.svg'
import { ICard } from '@/slice/cards/cards-type'
import Image from 'next/image'
import React from 'react'
import CardReview from './CardReview'
import CreateCardForm from './CreateCardForm'
import CreatedCardDetail from './CreatedCardDetail'

const CreateCardModal: React.FC<{
  provider: any
  cardType: string
  createdCard: ICard
  onCreateCard: (card) => void
}> = ({ onCreateCard, cardType, createdCard, provider }) => {
  const onClose = () => {
    provider.methods.setIsOpen(false)
  }
  const onCreateAnother = () => {
    console.log('')
  }

  return (
    <BaseModal provider={provider} classNames="h-full w-full flex flex-col rounded-none">
      <BaseModal.Body extendedClass="h-full">
        <div className="flex h-full">
          {/* Form & Information */}
          <div className="flex-1 h-full flex flex-col gap-6">
            <Button
              variant="ghost"
              height={32}
              label="Back to Cards"
              classNames="w-fit text-xs"
              onClick={onClose}
              leadingIcon={<Image src={ArrowBackIcon} alt="back" className="rotate-90" width={10} height={10} />}
            />
            {createdCard ? (
              <CreatedCardDetail createdCard={createdCard} onClose={onClose} onCreateAnother={onCreateAnother} />
            ) : (
              <CreateCardForm onCreateCard={onCreateCard} onClose={onClose} />
            )}
          </div>

          {/* Card Review */}
          <CardReview />
        </div>
      </BaseModal.Body>
    </BaseModal>
  )
}
export default CreateCardModal
