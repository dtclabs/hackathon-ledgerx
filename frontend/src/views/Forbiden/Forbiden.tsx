import React from 'react'
import Bubble from '@/components/Bubble/Bubble'
import Header from '@/components/Header'

const Forbiden: React.FC = () => (
  <div>
    <Header />
    <div className="w-full h-homeMainView flex justify-center">
      <div className="w-full max-w-[1200px] flex items-center justify-center">
        <div className="w-1/3 text-center">
          <div className="w-full flex justify-center">
            <div>
              <h1 className="text-lg text-gray-900 mt-7 mb-2">403: FORBIDEN</h1>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Bubble />
  </div>
)

export default Forbiden
