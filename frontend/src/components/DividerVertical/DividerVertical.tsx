import React from 'react'

interface IDividerVertical {
  className: string
  height: string
  space: string
}

const DividerVertical: React.FC<Partial<IDividerVertical>> = ({ className, height, space }) => (
  <div className={`${className || 'border-l border-dashboard-border-200'} ${height || 'h-3'} ${space || 'mx-3'}`} />
)

export default DividerVertical
