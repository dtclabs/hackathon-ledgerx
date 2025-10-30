import Button from '@/components-v2/atoms/Button'
import { FC, useState } from 'react'
import ContactTransactionModal from '@/views/_deprecated/Transactions/components/ContactTransaction/ContactTransaction'


import { createPortal } from 'react-dom'

interface IAddToContactsButton {
  addressToAdd: string
}

const AddToContactsButton: FC<IAddToContactsButton> = ({ addressToAdd }) => {
  const [isAddContactOpen, setIsContactOpen] = useState<boolean>(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()

  const handleOnClickAddContact = (address: string): void => {
    setIsContactOpen(true)
    setSelectedAddress(address)
  }

  return (
    <>
      <Button
        variant="grey"
        height={32}
        label="Add To Contacts"
        onClick={(e) => {
          e.stopPropagation()
          handleOnClickAddContact(addressToAdd)
        }}
      />
      {/* TODO-PENDGING - Upgrade the modal below and use the new APIs */}
      {createPortal(
        <ContactTransactionModal
          showModal={isAddContactOpen}
          setShowModal={setIsContactOpen}
          contactAddress={selectedAddress}
        />,
        document.body
      )}
    </>
  )
}

export default AddToContactsButton
