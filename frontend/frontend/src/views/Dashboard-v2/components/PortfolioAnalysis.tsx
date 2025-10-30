import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Typography from '@/components-v2/atoms/Typography'
import { ChevronDown } from 'lucide-react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ChartIcon from '@/public/svg/icons/large-clock.svg'

interface ChartData {
  date: string
  // dynamic token series keys: token1..token10
  [key: string]: string | number
}

interface Token {
  name: string
  color: string
  icon?: string
}

interface PortfolioAnalysisProps {
  timeframes: string[]
  selectedTimeframe: string
  chartData: ChartData[]
  tokens: Token[]
  hasWallets?: boolean
}

type LegendRendererProps = {
  payload?: any[]
  tokens: Token[]
}

const PortfolioLegend = ({ payload = [], tokens }: LegendRendererProps) => {
  const tokenByName = tokens.reduce<Record<string, Token>>((acc, t) => ({ ...acc, [t.name]: t }), {})

  return (
    <div className="flex flex-wrap gap-4 pl-2 pb-2 w-full items-center justify-center">
      {payload.map((item: any) => (
        <div key={item.value} className="flex items-center gap-2 bg-[#F5F5F5] px-2 py-1 rounded">
          {tokenByName[item.value]?.icon ? (
            <img src={tokenByName[item.value].icon as string} alt={item.value} width={16} height={16} />
          ) : (
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          )}
          <span className="text-xs text-gray-700">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({
  timeframes,
  selectedTimeframe,
  chartData,
  tokens,
  hasWallets = true
}) => {
  if (!hasWallets || tokens.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
            Portfolio Analysis
          </Typography>
        </div>
        <div className="flex justify-center h-64">
          <EmptyData>
            <EmptyData.Icon icon={ChartIcon} />
            <EmptyData.Title>No portfolio data available</EmptyData.Title>
            <EmptyData.Subtitle>Import a wallet to view your portfolio analysis</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
          Portfolio Analysis
        </Typography>
        {/* <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md text-sm cursor-pointer">
            <span>in USA</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex gap-0 bg-[#F5F5F5] rounded-md">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                type="button"
                className={`px-3 py-1 text-sm rounded ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div> */}
      </div>

      <div className="h-64 ">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(value) => value.split('-')[0]} />
            <YAxis domain={[-1200, 1200]} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(value) => `Date: ${value}`} formatter={(value, name) => [value, name]} />
            <Legend content={<PortfolioLegend tokens={tokens} />} />
            {tokens
              .slice(0, 10)
              .filter((t) => t.name !== 'DP')
              .map((t, idx) => (
                <Line
                  key={`token-line-${t.name}`}
                  type="monotone"
                  dataKey={`token${idx + 1}`}
                  stroke={t?.color || '#3B82F6'}
                  strokeWidth={2}
                  dot={false}
                  name={t?.name || `Token ${idx + 1}`}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PortfolioAnalysis
