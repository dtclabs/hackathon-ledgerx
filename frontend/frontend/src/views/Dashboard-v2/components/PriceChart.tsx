import React, { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Typography from '@/components-v2/atoms/Typography'
import { Menu, ChevronDown } from 'lucide-react'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import ChartIcon from '@/public/svg/icons/large-clock.svg'

interface ChartData {
  date: string
  price: number
}

interface PriceChartProps {
  selectedToken?: string
  chartData?: ChartData[]
  hasWallets?: boolean
}

const PriceChart: React.FC<PriceChartProps> = ({ selectedToken = 'SOL', chartData = [], hasWallets = true }) => {
  const [liveData, setLiveData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let ignore = false
    const fetchSol = async () => {
      try {
        setLoading(true)
        // Limit to last 365 days due to public API constraints
        const now = Date.now()
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
        const from = Math.floor(oneYearAgo / 1000)
        const to = Math.floor(now / 1000)
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/solana/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
        )
        const json = await res.json()
        // Aggregate to monthly (last available point per month)
        const byMonth: Record<string, number> = {}
        ;(json?.prices || []).forEach((p: [number, number]) => {
          const d = new Date(p[0])
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const key = `${yyyy}-${mm}`
          byMonth[key] = Number(p[1])
        })
        // Keep last 12 months sorted ascending
        const months = Object.keys(byMonth).sort().slice(-12)
        const monthlyPoints: ChartData[] = months.map((m) => ({ date: m, price: byMonth[m] }))
        if (!ignore) setLiveData(monthlyPoints)
      } catch (e) {
        // swallow for demo
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchSol()
    return () => {
      ignore = true
    }
  }, [])

  const dataToUse = chartData && chartData.length > 0 ? chartData : liveData
  const [minY, maxY] = useMemo(() => {
    if (!dataToUse || dataToUse.length === 0) return [0, 1]
    const values = dataToUse.map((d) => d.price)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(1, (max - min) * 0.1)
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]
  }, [dataToUse])

  if (!hasWallets) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
              Price
            </Typography>
            <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md text-sm cursor-pointer">
              <img src="/svg/sample-token/Solana.svg" alt="token" className="w-4 h-4" />
              <span>{selectedToken}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <Menu className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex justify-center h-48">
          <EmptyData>
            <EmptyData.Icon icon={ChartIcon} />
            <EmptyData.Title>No price data available</EmptyData.Title>
            <EmptyData.Subtitle>Import a wallet to view price charts</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Typography variant="heading3" classNames="text-lg font-semibold sm:text-base">
            Price
          </Typography>
          <div className="flex items-center gap-2 bg-[#F5F5F5] p-2 rounded-md text-sm cursor-pointer">
            <img src="/svg/sample-token/Solana.svg" alt="token" className="w-4 h-4" />
            <span>{selectedToken}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <Menu className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>

      <div className="h-48 overflow-x-auto">
        <ResponsiveContainer width={800} height="100%">
          <AreaChart data={dataToUse}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[minY, maxY]} tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip
              labelFormatter={(v) => `Date: ${v}`}
              formatter={(v) => [`$${(v as number).toLocaleString()}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PriceChart
