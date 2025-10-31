import RadioButtonCustom from '@/components-v2/atoms/RadioButtonCustom'

interface IChainSelectorRadio {
  selectedOption: any
  options: any[]
  onChange: (option) => void
  disabled?: boolean
}

const ChainSelectorRadio: React.FC<IChainSelectorRadio> = ({ selectedOption, options, onChange, disabled }) => (
  <div className="flex items-center gap-4 w-full flex-wrap">
    {options?.length &&
      options.map((chain) => (
        <RadioButtonCustom
          id={chain.value}
          key={chain.value}
          radioGroupName="chain-selector-radio"
          label={chain.label}
          imageUrl={chain.imageUrl}
          checked={selectedOption?.id === chain.id}
          onChange={() => onChange(chain)}
          disabled={disabled}
          labelClassNames="text-neutral-700 font-semibold px-3 py-2"
        />
      ))}
  </div>
)

export default ChainSelectorRadio
