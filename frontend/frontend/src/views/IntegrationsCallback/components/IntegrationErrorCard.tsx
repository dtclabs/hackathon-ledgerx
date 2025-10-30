/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react'
import { IErrorHandler } from '../integrations-callback.types'
import { Button } from '@/components-v2/Button'

interface IIntegrationErrorCardProps {
  error: IErrorHandler
  onClickRetry: () => void
}

const IntegrationErrorCard: FC<IIntegrationErrorCardProps> = ({ onClickRetry }) => (
  <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
    <div className="block rounded-lg shadow-lg bg-white max-w-sm font-inter">
      <div className="p-6">
        <p className="text-center mb-4">LedgerX.</p>
        <h3 className="text-xl mt-2  text-center">Oops! Sorry an error has occurred with registering</h3>
        <p className="text-xs text-center mt-2">Don't worry our team has been notified</p>
      </div>

      <hr />
      <div className="p-4 flex gap-4 flex-row">
        <Button variant="contained" color="primary" onClick={onClickRetry} fullWidth>
          Retry Xero Login
        </Button>
      </div>
    </div>
  </div>
)

export default IntegrationErrorCard
