import React from 'react'
import Image from 'next/legacy/image'

const AssetOptionLabel = (option) => (
  <div
    className={`flex items-center gap-2 font-inter text-sm leading-4 truncate ${option.className} ${
      option?.disabled && 'opacity-40 cursor-not-allowed text-neutral-900'
    }`}
  >
    {option?.image && <Image src={option.image} alt={`${option.label}-icon`} width={14} height={14} />}
    <p>{option.label}</p>
  </div>
)
export default AssetOptionLabel
