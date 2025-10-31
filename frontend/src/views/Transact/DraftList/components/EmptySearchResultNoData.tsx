import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import PalmWithCoinsIcon from '@/public/svg/empty-data-icons/palm-with-coins.svg'
import BlackCaretIcon from '@/public/svg/icons/caret-icon.svg'
import { FC } from 'react'
import { CREATE_DRAFT_OPTIONS } from '../copy'

interface IEmptySearchResultNoData {
  isLoading?: boolean
  isFiltered?: boolean
  title: string
  subtitle?: string
  ctaLabel?: string
  onClickCta?: () => void
}

const EmptySearchResultNoData: FC<IEmptySearchResultNoData> = ({
  isLoading,
  onClickCta,
  isFiltered,
  title,
  subtitle,
  ctaLabel
}) => (
  <EmptyData loading={isLoading}>
    <EmptyData.Icon icon={PalmWithCoinsIcon} />
    <EmptyData.Title>{isFiltered ? 'No Payments Found' : title}</EmptyData.Title>
    {!isFiltered && <EmptyData.Subtitle>{subtitle}</EmptyData.Subtitle>}
    {!isFiltered && ctaLabel && (
      <ButtonDropdown>
        <ButtonDropdown.CTA variant="grey" label={ctaLabel} caretIcon={BlackCaretIcon} />
        <ButtonDropdown.Options extendedClass="min-w-[153px]" options={CREATE_DRAFT_OPTIONS} onClick={onClickCta} />
      </ButtonDropdown>
    )}
  </EmptyData>
)

export default EmptySearchResultNoData
