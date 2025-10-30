import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import SampleCard from '@/public/svg/sample-card.svg'
import Image from 'next/image'
import React from 'react'

const CreateCardBanner: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex  gap-6 rounded-xl bg-dashboard-background p-6 items-stretch mb-4">
    <Image priority src={SampleCard} alt="sample-card" width={255} height={160} />

    <div className="py-4 flex-1 flex flex-col gap-3">
      <Typography variant="heading3">Get your first self-custodial corporate card today!</Typography>
      <Typography variant="body2" color="secondary" classNames="flex-1">
        Descriptions
      </Typography>
      <Button height={40} variant="black" label="Create Card" classNames="w-fit" onClick={onStart} />
    </div>
  </div>
)
export default CreateCardBanner
