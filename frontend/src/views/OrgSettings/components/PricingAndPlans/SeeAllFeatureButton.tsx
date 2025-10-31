import Typography from '@/components-v2/atoms/Typography'

interface SeeAllFeaturesProps {
  title: string
  onClick: () => any
}
const SeeAllFeaturesButton = ({ title, onClick }: SeeAllFeaturesProps) => (
  <button type="button" onClick={onClick}>
    <Typography color="black" styleVariant="semibold" classNames="underline underline-offset-2">
      {title}
    </Typography>
  </button>
)

export default SeeAllFeaturesButton
