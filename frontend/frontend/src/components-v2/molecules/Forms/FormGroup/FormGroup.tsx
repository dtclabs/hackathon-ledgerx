import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'

interface IFormGroupProps {
  children: any
  label?: string
  required?: boolean
  error?: string
  extendClass?: string
  id?: string
}

const FormGroup: FC<IFormGroupProps> = ({ children, label, required, error, extendClass, id }) => (
  <div className={extendClass}>
    <div className="flex flex-row gap-1 mb-2">
      {label && (
        <Typography variant="body2" color="primary">
          {label}
        </Typography>
      )}
      {required && (
        <Typography variant="caption" classNames="!text-error-500">
          &#42;
        </Typography>
      )}
    </div>
    {children}
    {error && (
      <div className="mt-2 ml-1">
        <Typography variant="caption" classNames="!text-error-500">
          {error}
        </Typography>
      </div>
    )}
  </div>
)
export default FormGroup
