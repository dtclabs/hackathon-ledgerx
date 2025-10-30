import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Typography from '@/components-v2/atoms/Typography'
import { Menu } from 'lucide-react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ChartIcon from '@/public/svg/icons/large-clock.svg'

interface ChartData {
  month: string
  transactions: number
}

interface MonthlyTransactionProps {
  chartData: ChartData[]
  hasWallets?: boolean
}

const MonthlyTransaction: React.FC<MonthlyTransactionProps> = ({ chartData, hasWallets = true }) => {
  if (!hasWallets || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
            Monthly Transaction
          </Typography>
          <Menu className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex justify-center h-48">
          <EmptyData>
            <EmptyData.Icon icon={ChartIcon} />
            <EmptyData.Title>No transaction data available</EmptyData.Title>
            <EmptyData.Subtitle>Import a wallet to view transaction history</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
          Monthly Transaction
        </Typography>
        <Menu className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>

      <div className="h-48 overflow-x-auto">
        <ResponsiveContainer width={800} height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(value) => value.split('-')[0]} />
            <YAxis
              domain={[20000, 100000]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              labelFormatter={(value) => `Month: ${value}`}
              formatter={(value) => [`${(value as number).toLocaleString()}`, 'Transactions']}
            />
            <Line type="monotone" dataKey="transactions" stroke="#8B5CF6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MonthlyTransaction
