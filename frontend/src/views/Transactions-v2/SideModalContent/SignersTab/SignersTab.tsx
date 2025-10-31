import { FC } from 'react'
import Avvvatars from 'avvvatars-react'
import { useAppSelector } from '@/state'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import Typography from '@/components-v2/atoms/Typography'

interface ISignersTab {
  data: any
}

const SignersTab: FC<ISignersTab> = ({ data }) => {
  const { timezone: timeZonesetting, country: countrySetting } = useAppSelector(orgSettingsSelector)

  return (
    <div className="mt-6">
      {data?.confirmations?.map((confirmation, index) => (
        <div
          className={`flex justify-between items-center py-5 ${
            index < data.confirmations.length - 1 && 'border-b border-grey-200'
          }`}
        >
          <div className="flex-1">
            {confirmation?.ownerContact?.name ? (
              <div className="flex flex-row items-center gap-3 text-sm">
                <Avvvatars value={confirmation?.ownerContact?.name} />
                <Typography variant="body2" color="dark">
                  {confirmation?.ownerContact?.name}
                </Typography>
              </div>
            ) : (
              <WalletAddress
                noColor
                noCopy
                noScan
                useAddress
                showFirst={5}
                showLast={4}
                className="text-sm text-dashboard-darkMain leading-4 font-normal"
                address={confirmation?.owner}
              />
            )}
          </div>
          {confirmation?.submissionDate && (
            <div className="flex flex-col items-end gap-1 flex-1 font-inter">
              <div className="flex items-center gap-[10px]">
                <img src="/svg/GreenTick.svg" alt="Tick" width={10} height={10} />
                <Typography variant="body2" color="success">
                  Confirmed
                </Typography>
              </div>

              <Typography variant="caption" classNames="!text-dashboard-sub">
                On{' '}
                {formatTimeBasedonUTCOffset(
                  confirmation?.submissionDate,
                  timeZonesetting?.utcOffset || 480,
                  countrySetting?.iso || 'SG'
                )}
              </Typography>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SignersTab
