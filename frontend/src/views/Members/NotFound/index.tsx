import Typography from '@/components-v2/atoms/Typography'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { EmptyData } from '@/components-v2/molecules/EmptyData'

const MemberNotFound = ({
  title,
  image,
  subTitle,
  cta
}: {
  title: string
  image: any
  subTitle?: string
  cta?: { label: string; onClick: (e) => void }
}) => {
  const showBanner = useAppSelector(showBannerSelector)

  return (
    <div
      className={`${
        showBanner ? 'h-[calc(100vh-458px)]' : 'h-[calc(100vh-390px)]'
      } flex justify-center items-center flex-col`}
    >
      <EmptyData>
        <EmptyData.Icon icon={image} />
        <EmptyData.Title>{title}</EmptyData.Title>
        {subTitle && <EmptyData.Subtitle>{subTitle}</EmptyData.Subtitle>}
        {cta && <EmptyData.CTA label={cta.label} onClick={cta.onClick} />}
      </EmptyData>
    </div>
  )
}

export default MemberNotFound
