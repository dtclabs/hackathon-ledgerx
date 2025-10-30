import { FC, ReactNode } from 'react'

interface IProps {
  children: ReactNode
}

const DashboardCard: FC<IProps> = ({ children }) => (
  <div
    className="rounded-lg p-4 h-[488px] bg-white"
    // style={{ boxShadow: '0px 16px 48px -16px rgba(0, 0, 0, 0.02), 0px 0px 80px rgba(0, 0, 0, 0.05)' }}
  >
    {children}
  </div>
)

export default DashboardCard
