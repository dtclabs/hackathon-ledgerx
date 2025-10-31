import React from 'react'
import Loader from '../Loader/Loader'

interface IInProcessToast {
  title?: string
  description?: string
  customBanner?: any
}

const InProcessToast: React.FC<IInProcessToast> = ({ title = 'Connecting', description = '', customBanner }) => (
  <div
    className="fixed w-full h-full max-h-full inset-0 flex items-center bg-gray-700 bg-opacity-70  overflow-x-hidden overflow-y-auto z-[1000]"
    aria-hidden
  >
    <div className="w-full max-h-full flex justify-center items-start">
      <div className="flex flex-col justify-center items-center">
        <Loader title={title} description={description} />
        {customBanner && (
          <div className="mt-10" style={{ bottom: '5%', position: 'absolute' }}>
            {customBanner}
          </div>
        )}
      </div>
    </div>
  </div>
)

export default InProcessToast
