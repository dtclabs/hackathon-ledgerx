import React from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { ArrowUpIcon } from 'lucide-react'

interface MetricsCardProps {
  label: string
  value: string
  additionalInfo?: string
  trend?: string | null
  hasWallets?: boolean
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, additionalInfo, trend, hasWallets = true }) => {
  // Determine display values based on wallet status
  const displayValue = hasWallets ? value : label.includes('DATE') || label.includes('TRANSACTION') ? '-' : '0'
  const displayAdditionalInfo = hasWallets ? additionalInfo : null
  const displayTrend = hasWallets ? trend : null

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <Typography variant="overline" color="secondary" classNames="!text-sm !text-[#858585] !font-bold sm:!text-xs">
          {label}
        </Typography>
        {displayTrend ? (
          <div className="flex items-center gap-1 text-[#28A745] bg-[#CCF1D5] px-[6px] py-0.5 rounded-full">
            <ArrowUpIcon className="w-4 h-4" />
            <Typography variant="caption" classNames="!text-sm font-medium text-[#28A745] sm:!text-xs">
              {displayTrend}
            </Typography>
          </div>
        ) : (
          displayAdditionalInfo && (
            <span className="bg-blue-100 text-[#0079DA] text-sm font-normal px-2.5 py-0.5 rounded-full sm:!text-xs">
              {displayAdditionalInfo}
            </span>
          )
        )}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Typography variant="heading2" classNames="text-2xl font-bold text-gray-900 sm:!text-base">
          {displayValue}
        </Typography>
      </div>
    </div>
  )
}

export default MetricsCard
