import Typography from '@/components-v2/atoms/Typography'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import React from 'react'

const FormatOptionLabelToken: React.FC<IFormatOptionLabel> = ({ src, label }) => (
  <div className="flex gap-3">
    <Typography classNames="flex items-center justify-center w-6 h-6 bg-white rounded-full">
      {src ? <img src={src} alt="Token" className="h-6 w-auto" /> : label?.substring(0, 1)}
    </Typography>
    <Typography classNames="truncate" variant="body2" color="dark" styleVariant="medium">
      {label}
    </Typography>
  </div>
)
export default FormatOptionLabelToken
