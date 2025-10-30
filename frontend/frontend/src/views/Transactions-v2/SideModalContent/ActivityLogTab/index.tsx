import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { format } from 'date-fns'

interface Idata {
  data: {
    createdAt: number | Date
    createdBy: string
    reviewedAt: number | Date
    reviewedBy: string
    executedAt: number | Date
    executedBy: string
  }
}

const isValidDate = (_date) => {
  if (_date === null || _date === undefined) {
    return false
  }
  const date = new Date(_date)
  return !Number.isNaN(date.getTime())
}

const ActivityLogTab: FC<Idata> = ({ data }) => {
  const properties = [
    {
      title: 'Created On',
      value: isValidDate(data?.createdAt) ? format(new Date(data.createdAt), 'dd MMM yyyy, hh:mm a') : '-'
    },
    {
      title: 'Created By',
      value: data?.createdBy ?? '-'
    },
    {
      title: 'Reviewed On',
      value: isValidDate(data?.reviewedAt) ? format(new Date(data.reviewedAt), 'dd MMM yyyy, hh:mm a') : '-'
    },
    {
      title: 'Reviewed By',
      value: data?.reviewedBy ?? '-'
    },
    {
      title: 'Executed On',
      value: isValidDate(data?.executedAt) ? format(new Date(data.executedAt), 'dd MMM yyyy, hh:mm a') : '-'
    },
    {
      title: 'Executed By',
      value: data?.executedBy ?? '-'
    }
  ]

  return (
    <div className="w-full mt-6 gap-y-5">
      <ul className="list-none">
        {properties.map(({ title, value }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index + title + value} className="flex justify-between mb-6">
            <Typography variant="body2" color="secondary" styleVariant="semibold">
              {title}
            </Typography>
            <Typography variant="body2" color="secondary" classNames="truncate max-w-[200px]">
              {value}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ActivityLogTab
