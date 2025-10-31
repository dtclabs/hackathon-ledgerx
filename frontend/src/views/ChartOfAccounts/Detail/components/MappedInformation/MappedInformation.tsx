import React from 'react'
import MappedRow from './MappedRow'

interface ICoAMappedInformation {
  coaMapper: { id: number; walletName: string; mappedAssets: { id: string; symbol: string; image: string }[] }[]
}

const CoAMappedInformation: React.FC<ICoAMappedInformation> = ({ coaMapper }) => (
  <div className="mt-5 flex flex-col gap-6 h-[calc(100vh-260px)] overflow-auto scrollbar">
    {coaMapper?.length &&
      coaMapper.map((row) => <MappedRow key={row.id} walletName={row.walletName} mappedAssets={row.mappedAssets} />)}
  </div>
)

export default CoAMappedInformation
