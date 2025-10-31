import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { ICard } from '@/slice/cards/cards-type'

const CreatedCardDetail: React.FC<{ createdCard?: ICard; onClose; onCreateAnother }> = ({
  createdCard,
  onClose,
  onCreateAnother
}) => (
  <>
    <div className="flex-1 flex flex-col gap-6 justify-center">
      <Typography variant="heading1">Your virtual card is created!</Typography>
    </div>

    <div className="flex items-center gap-4">
      <Button variant="grey" height={40} label="Close" classNames="w-fit" onClick={onClose} />
      <Button variant="black" height={40} label="Create Another Card" classNames="w-fit" onClick={onCreateAnother} />
    </div>
  </>
)

export default CreatedCardDetail
