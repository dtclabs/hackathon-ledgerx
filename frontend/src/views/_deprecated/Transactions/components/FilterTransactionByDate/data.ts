export interface IPreSetRange {
  key: string
  name: string
  start: Date
  end: Date
  monthRange?: number
}

export const PreSetRange: IPreSetRange[] = [
  {
    key: 'today',
    name: 'Today',
    start: new Date(),
    end: new Date()
  },
  {
    key: 'yesterday',
    name: 'Yesterday',
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    key: 'last7Days',
    name: 'Last 7 Days',
    start: new Date(new Date().setDate(new Date().getDate() - 6)),
    end: new Date()
  },
  {
    key: 'last30Days',
    name: 'Last 30 Days',
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  },
  {
    key: 'thisMonth',
    name: 'This Month',
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  },
  {
    key: 'lastMonth',
    name: 'Last Month',
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  },
  {
    key: 'thisYear',
    name: 'This Year',
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear() + 1, 0, 0),
    monthRange: 11
  },
  {
    key: 'lastYear',
    name: 'Last Year',
    start: new Date(new Date().getFullYear() - 1, 0, 1),
    end: new Date(new Date().getFullYear(), 0, 0),
    monthRange: 11
  }
]
