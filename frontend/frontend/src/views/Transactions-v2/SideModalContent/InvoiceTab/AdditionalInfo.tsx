import { useState, useMemo, FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import Accordion from '@/components-v2/molecules/Accordion'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import CaretIcon from '@/public/svg/icons/caret-icon.svg'
import { Badge2 } from '@/components-v2/molecules/Badge'
import ReactTooltip from 'react-tooltip'

interface IAdditionalInfo {
  metadata: {
    note: string
    tags: string[]
  }
}

const AdditionalInfo: FC<IAdditionalInfo> = ({ metadata }) => {
  const [isExpand, setIsExpand] = useState(false)

  const additionalInfoExpandElement = useMemo(
    () => (
      <div>
        {metadata?.note && (
          <div className="mt-6">
            <Typography variant="body2" color="primary" styleVariant="semibold">
              Notes
            </Typography>
            <Typography variant="body2" color="secondary" classNames="mt-2">
              {metadata?.note}
            </Typography>
          </div>
        )}
        {metadata?.tags?.length > 0 && (
          <div className="mt-6 ">
            <Typography variant="body2" color="primary" styleVariant="semibold">
              Tags
            </Typography>
            <div className="flex flex-wrap items-center mt-4 gap-2">
              {metadata?.tags.map((tag) => (
                <div>
                  <Badge2 variant="rounded">
                    <Badge2.Label color="primary">{tag}</Badge2.Label>
                  </Badge2>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    [metadata?.note, metadata?.tags]
  )

  const isDisabled = () => {
    if (!metadata?.note && metadata?.tags?.length === 0) {
      return true
    }
    return false
  }

  return (
    <Accordion
      fullWidth
      isExpand={isExpand}
      setIsExpand={setIsExpand}
      expandElement={additionalInfoExpandElement}
      wrapperClassName="bg-white"
      disabled
    >
      <div className="flex items-center justify-between">
        <Typography variant="body1" color="primary" styleVariant="semibold">
          Additional information
        </Typography>
        <Button
          label={isExpand ? 'Hide detail' : 'Show detail'}
          data-for="invoice-additional-info"
          data-tip="invoice-additional-info"
          disabled={isDisabled()}
          variant="grey"
          height={32}
          trailingIcon={
            <Image
              src={CaretIcon}
              className={`${isExpand ? 'transform rotate-180' : ''} transition-transform duration-200 ease-in-out`}
            />
          }
          onClick={() => setIsExpand(!isExpand)}
        />
        {isDisabled() && (
          <ReactTooltip
            id="invoice-additional-info"
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg"
          >
            There are no details attached to this invoice
          </ReactTooltip>
        )}
      </div>
    </Accordion>
  )
}

export default AdditionalInfo
