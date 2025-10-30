import Typography from '@/components-v2/atoms/Typography'
import { FC } from 'react'

interface IStepperProps {
  step: number
}

const Stepper: FC<IStepperProps> = ({ step }) => (
  <div className="flex flex-row items-center font-inter">
    <div className="flex flex-row items-center gap-2 flex-grow">
      <CircleIcon label={1} active={step === 1} completed={step > 1} />
      <Typography variant="caption" styleVariant="semibold" color="black">
        Account Setup
      </Typography>
      <div className="w-100 flex-grow" style={{ borderTop: `1.5px solid ${step > 1 ? '#0BA740' : 'black'}` }} />
    </div>
    <div className="flex flex-row items-center gap-2 pl-4 flex-grow">
      <CircleIcon label={2} active={step === 1.5} completed={step > 1.5} />
      <Typography variant="caption" styleVariant="semibold" color="black">
        Verify Account
      </Typography>
      <div className="w-100 flex-grow" style={{ borderTop: `1.5px solid ${step > 1.5 ? '#0BA740' : 'black'}` }} />
    </div>
    <div className="flex flex-row items-center gap-2 pl-4">
      <CircleIcon label={3} active={step === 2} />
      <Typography variant="caption" styleVariant="semibold" color="black">
        Personal Details
      </Typography>
    </div>
  </div>
)

const CircleIcon = ({ active = false, label, completed = false }) => {
  const dynamicClass = active ? 'bg-[#101828]' : 'bg-neutral-400'
  const completedClass = completed ? 'bg-green-600' : ''
  return active ? (
    <div className={`${dynamicClass} ${completedClass} circleIcon`} style={{ color: 'white', fontSize: 12 }}>
      {completed ? <img src="/svg/check.svg" alt="check" /> : label}
    </div>
  ) : (
    <div
      className={`${completedClass} ${dynamicClass} flex justify-center items-center text-white`}
      style={{
        height: 25,
        width: 25,
        borderRadius: '50%',

        padding: 5,
        fontSize: 12,
        border: '1.5px solid white',
        ...(active && { outline: '1.5px solid #101828' })
      }}
    >
      {completed ? <img src="/svg/check.svg" alt="check" /> : label}
    </div>
  )
}

export default Stepper
