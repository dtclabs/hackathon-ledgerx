import { INftTrait } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'

const TraitsTable = ({ traits, id }: { traits: INftTrait[]; id: string }) => (
  <div className="rounded-lg border border-grey-200">
    <div className="rounded-t-lg flex items-center justify-between p-4 bg-gray-50">
      <Typography color="primary" variant="body1" styleVariant="semibold">
        Traits ({traits?.length || 0})
      </Typography>
    </div>
    {traits?.length > 0 ? (
      <div className="grid grid-cols-4 p-4 gap-2">
        {traits.map((item) => (
          <div
            key={`${id}-${item.key}`}
            className="flex flex-col gap-3 bg-grey-100 rounded-lg border border-grey-200 p-4"
          >
            <Typography color="secondary" styleVariant="semibold" variant="overline" classNames="truncate">
              {item.key}
            </Typography>
            <div className="flex items-center justify-between gap-2">
              <Typography color="primary" classNames="truncate">
                {item.value}
              </Typography>
              <Typography color="primary" variant="caption" classNames="bg-dashboard-border-200 px-[10px] py-1 rounded">
                {item.percentage}%
              </Typography>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="h-[200px] flex items-center justify-center">
        <Typography color="secondary" variant="heading3">
          No Trait Found
        </Typography>
      </div>
    )}
  </div>
)

export default TraitsTable
