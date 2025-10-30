import { StatusChip } from '@/components-v2/StatusChip'
import Typography from '@/components-v2/atoms/Typography'
import Badge from '@/components-v2/molecules/Badge/Badge2'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import SampleCard from '@/public/svg/sample-card.svg'
import { CardStatus, ICard } from '@/slice/cards/cards-type'
import { capitalize } from 'lodash'
import Image from 'next/image'
import React from 'react'
import ReactTooltip from 'react-tooltip'

const MAX_DISPLAY_TAGS = 2

const CardItem: React.FC<{ card: ICard }> = ({ card }) => (
  <>
    <BaseTable.Body.Row.Cell>
      <div className="flex items-center gap-2">
        <Image src={SampleCard} alt="icon" width={32} height={20} />
        <Typography variant="body2">{card?.displayName}</Typography>
      </div>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <Typography variant="body2">{card?.truncatedNumber}</Typography>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <Typography variant="body2">{card?.assignee}</Typography>
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      {card?.annotations?.length > 0 ? (
        <div className="flex gap-1">
          {card.annotations.slice(0, MAX_DISPLAY_TAGS).map((tag) => (
            <TagItem key={tag.id} tag={{ value: tag.id, label: tag.name }} clearable={false} />
          ))}
          {card.annotations.length > MAX_DISPLAY_TAGS && (
            <>
              <div
                className="flex items-center gap-2 bg-neutral-100 py-1 px-2 rounded"
                data-tip={`extra-card-tags-${card.id}`}
                data-for={`extra-card-tags-${card.id}`}
              >
                <Typography classNames="!text-neutral-900" styleVariant="regular" variant="caption">
                  +{card.annotations.length - MAX_DISPLAY_TAGS}
                </Typography>
              </div>
              <ReactTooltip
                id={`extra-card-tags-${card.id}`}
                borderColor="#eaeaec"
                border
                place="top"
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg max-w-[220px] !px-3"
              >
                <div className="flex flex-wrap gap-2">
                  {card.annotations.slice(MAX_DISPLAY_TAGS).map((tag) => (
                    <TagItem key={tag.id} tag={{ value: tag.id, label: tag.name }} clearable={false} />
                  ))}
                </div>
              </ReactTooltip>
            </>
          )}
        </div>
      ) : (
        '-'
      )}
    </BaseTable.Body.Row.Cell>
    <BaseTable.Body.Row.Cell>
      <Badge variant="rounded" extendedClass="w-fit" color={card?.status === CardStatus.ACTIVE ? 'success' : 'error'}>
        <Badge.Label>{capitalize(card.status)}</Badge.Label>
      </Badge>
    </BaseTable.Body.Row.Cell>
  </>
)

export default CardItem
