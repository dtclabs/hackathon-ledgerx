import RadioButtonCustom from '@/components-v2/atoms/RadioButtonCustom'
import Typography from '@/components-v2/atoms/Typography'

const SelectDeployChain = ({
  availableChainsToDeploy,
  targetChain,
  handleOnClickChain
}: {
  availableChainsToDeploy: any[]
  targetChain: string
  handleOnClickChain: (chain) => () => void
}) => (
  <div className="flex flex-col gap-4">
    <Typography color="primary" styleVariant="semibold" variant="body1">
      Please select which chain you would like to add your Safe to.
    </Typography>

    <div className="grid grid-cols-2 gap-4 mb-4">
      {availableChainsToDeploy?.map((chain) => (
        <RadioButtonCustom
          wrapperClassNames="!max-w-full !p-4 !bg-dashboard-background"
          label={chain.name}
          imageUrl={chain.imageUrl}
          checked={targetChain === chain.id}
          onClick={handleOnClickChain(chain)}
          radioGroupName="safe-deploy-chain"
          id={chain.id}
          key={chain.id}
        />
      ))}
    </div>
  </div>
)

export default SelectDeployChain
