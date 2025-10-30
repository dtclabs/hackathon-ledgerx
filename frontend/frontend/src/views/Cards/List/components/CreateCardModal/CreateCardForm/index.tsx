import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'

const CreateCardForm: React.FC<{ onCreateCard: any; onClose: () => void }> = ({ onCreateCard, onClose }) => (
  <>
    <form className="flex-1 flex flex-col gap-6">
      <Typography variant="heading1">Create Virtual Card</Typography>
    </form>
    <Typography variant="caption" color="secondary">
      Note: A $2,000 SGD limit per transaction is applied by default.
    </Typography>

    <div className="flex items-center gap-4">
      <Button variant="grey" height={40} label="Cancel" classNames="w-fit" onClick={onClose} />
      <Button variant="black" height={40} label="Create Card" classNames="w-fit" onClick={onCreateCard} />
    </div>
  </>
)

export default CreateCardForm
