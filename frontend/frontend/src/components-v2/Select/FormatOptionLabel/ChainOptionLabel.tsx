import React from 'react'
import Image from 'next/legacy/image'

const ChainOptionLabel = (option) => (
  <div
    className={`flex items-center gap-4 font-inter text-sm leading-4 truncate ${option.className} ${
      option?.disabled && 'opacity-40 cursor-not-allowed text-neutral-900'
    }`}
  >
    {option?.image && (
      <Image src={option?.image} width={16} height={16} className="rounded" alt={`${option.label}-icon`} />
    )}

    <p>{option.label}</p>
  </div>
)
export default ChainOptionLabel
