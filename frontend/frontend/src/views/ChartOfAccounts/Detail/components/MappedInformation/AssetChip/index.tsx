import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'

const AssetChip = ({ icon, symbol }) => (
  <div className="flex items-center gap-2 rounded-[100px] bg-neutral-100 px-[10px] py-[6px]">
    <Image src={icon} width={14} height={14} alt={symbol} />
    <Typography variant="body2" styleVariant="regular" color="primary">
      {symbol}
    </Typography>
  </div>
)

export default AssetChip
