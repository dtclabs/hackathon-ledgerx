import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Arrow from '@/public/svg/icons/arrow-narrow-right.svg'
import SampleCard from '@/public/svg/sample-card.svg'
import Image from 'next/image'
import React from 'react'

const InitialBanner: React.FC<{ onStartOnboarding: () => void }> = ({ onStartOnboarding }) => (
  <div className="flex items-center gap-10 rounded-xl bg-gradient-to-r from-[#000000] to-[#161616] relative mt-6">
    {/* Left panel */}
    <div className="p-16 flex-1 flex flex-col gap-10">
      <Typography variant="heading1" classNames="text-[60px] leading-[70px] text-grey-200">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FDF77D] to-[#FFFFCC]">Own</span> the way
        you make{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FDF77D] to-[#FFFFCC]">payments.</span>
      </Typography>
      <Typography classNames="text-[#E2E2E0] text-[18px] leading-6 max-w-[340px]">
        Manage your team’s spend without compromising on self-control (i.e. to remain self-custodial).
        <br />
        Get your self-custodial corporate card now!
      </Typography>
      <Button
        height={48}
        variant="yellow"
        label="Get Started Now"
        classNames="w-fit bg-[#FDF77D] z-[2]"
        trailingIcon={<Image src={Arrow} alt="arrow" height={16} width={16} />}
        onClick={onStartOnboarding}
      />
    </div>

    {/* Right panel */}
    <div className="p-16 flex-1 bg-radial-gradient flex items-center justify-center">
      <Image priority src={SampleCard} alt="sample-card" width={330} />
    </div>

    <div className="bg-[#FFFFFF0F] rotate-[-15deg] w-[50%] absolute h-[750px] laptop:left-[-40px] left-[-60px]" />
  </div>
)
export default InitialBanner
