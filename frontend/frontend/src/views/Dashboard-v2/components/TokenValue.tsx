import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Typography from '@/components-v2/atoms/Typography'
import { ChevronDown } from 'lucide-react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ChartIcon from '@/public/svg/icons/large-clock.svg'

interface ChartData {
  period: string
  value: number
}

interface TokenValueProps {
  selectedFilter: string
  chartData: ChartData[]
  hasWallets?: boolean
}

const TokenValue: React.FC<TokenValueProps> = ({ selectedFilter, chartData, hasWallets = true }) => {
  if (!hasWallets || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-between w-full">
            <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
              Token Value
            </Typography>
          </div>
        </div>
        <div className="flex justify-center h-[380px]">
          <EmptyData>
            <EmptyData.Icon icon={ChartIcon} />
            <EmptyData.Title>No token data available</EmptyData.Title>
            <EmptyData.Subtitle>Import a wallet to view token values</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 h-full ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between w-full">
          <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
            Token Value
          </Typography>
          {/* <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md text-sm cursor-pointer">
              <span>in USA</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md text-sm cursor-pointer">
              <span>All Tokens</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div> */}
        </div>
      </div>

      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[-1200, 1200]} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(value) => `Period: ${value}`} formatter={(value) => [value, 'Value']} />
            <Bar dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.period} fill={entry.value >= 0 ? '#3B82F6' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TokenValue
