import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import Typography from '@/components-v2/atoms/Typography'
// import { ArrowUpIcon } from '@heroicons/react/24/solid'
import Image from 'next/legacy/image'
import { ArrowDownIcon, ArrowUpIcon, ChevronDown } from 'lucide-react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import WalletIcon from '@/public/svg/icons/blue-icon-money.svg'

interface Token {
  id: string
  name: string
  symbol: string
  amount: number
  value: number
  trend: number
  color: string
  icon: string
}

interface WalletOverviewProps {
  totalValue: number
  trend: number
  tokens: Token[]
  hasWallets?: boolean
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ totalValue, trend, tokens, hasWallets = true }) => {
  const chartData = tokens.map((token) => ({
    name: token.symbol,
    value: token.value,
    color: token.color
  }))

  if (!hasWallets || tokens.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
            Wallet Overview
          </Typography>
        </div>
        <div className="flex justify-center h-64">
          <EmptyData>
            <EmptyData.Icon icon={WalletIcon} />
            <EmptyData.Title>No wallet data available</EmptyData.Title>
            <EmptyData.Subtitle>Import a wallet to view your portfolio overview</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
          Wallet Overview
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

      <div className="flex gap-6 sm:flex-col">
        {/* Donut Chart */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <ResponsiveContainer width={216} height={216}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Typography variant="overline" color="secondary" classNames="!text-xs">
                TOTAL BALANCE
              </Typography>
              <Typography variant="heading2" classNames="!text-base font-bold">
                ${totalValue.toLocaleString()}
              </Typography>

              {/* <ArrowUpIcon className="w-3 h-3" /> */}
              <div className="!text-xs flex items-center gap-1 text-[#28A745] bg-[#CCF1D5] px-[6px] rounded-full">
                <ArrowUpIcon size={12} />
                {trend}%
              </div>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1">
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: token.color }}
                  >
                    <Image src={token.icon} alt={token.symbol} width={16} height={16} />
                  </div>
                  <div>
                    <Typography variant="body2" classNames="font-medium">
                      {token.name}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {token.amount} {token.symbol}
                    </Typography>
                  </div>
                </div>
                <div className="items-end flex flex-col gap-1">
                  {token.trend > 0 ? (
                    <div className="text-[#28A745] bg-[#CCF1D5] px-[6px] rounded-full flex items-center gap-1 text-xs w-fit">
                      <ArrowUpIcon size={12} />
                      {token.trend}%
                    </div>
                  ) : (
                    <div className="text-[#B41414] bg-[#FFE3E3] px-[6px] rounded-full flex items-center gap-1 text-xs w-fit">
                      <ArrowDownIcon size={12} />
                      {token.trend}%
                    </div>
                  )}
                  <Typography variant="body2" classNames="font-normal text-xs !text-[#999999]">
                    {token.value.toLocaleString()} USD
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletOverview
