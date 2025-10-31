import { useState } from 'react'

const CardReview: React.FC<{ cardDetail?: any }> = ({ cardDetail }) => {
  const [viewDetail, setViewDetail] = useState(false)

  return (
    <div
      className="flex-1 h-full rounded-xl flex items-center justify-center"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, #3A3A3A 0%, #000000 100%)'
      }}
    >
      card
    </div>
  )
}
export default CardReview
