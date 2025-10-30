import React, { useEffect, useState } from 'react'

interface ITokenManage {
  onSave: (data: any) => void
}

const TokenManage: React.FC<ITokenManage> = ({ onSave }) => {
  const handleSave = (data: any) => {
    if (onSave) onSave(data)
  }

  return (
    <div className="p-6">
      <div className="rounded-lg border">
        <div className="px-8 py-6 border-b">Token Manage</div>
        <div className="p-8 flex flex-col gap-8">Content</div>
      </div>
    </div>
  )
}
export default TokenManage
