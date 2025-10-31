import Modal from '@/components/Modal'

const AddContactModal = ({ setShowModal, showModal, onClose }) => (
  <Modal zIndex="z-50" isDisabledOuterClick setShowModal={setShowModal} showModal={showModal} onClose={onClose}>
    <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white p-4">LALALAL</div>
  </Modal>
)

export default AddContactModal
