import Typography from '@/components-v2/atoms/Typography'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import TextField from '@/components/TextField/TextField'
import { useState } from 'react'
import { components, MenuListProps, MenuProps } from 'react-select'

interface ICategory {
  id: string
  value: string
}

const MenuCategory = (props: MenuProps<IFormatOptionLabel>) => {
  const [category, setCategory] = useState<ICategory[]>([])
  const [showTextField, setShowTextField] = useState(false)
  const handleAddCategory = () => {
    setShowTextField(true)
  }
  const onMouseDown = (e) => e.target.type !== 'text' && props.innerProps.onMouseDown(e)

  return (
    <components.Menu {...props} innerProps={{ ...props.innerProps, onMouseDown }}>
      <Typography classNames="!text-[#98A2B3] px-2 pt-2 pb-1" styleVariant="medium" variant="caption">
        Select an account
      </Typography>
      {props.options.length === 0 ? (
        <Typography classNames="my-5 flex justify-center" color="dark" variant="body1">
          No Data To Display.
        </Typography>
      ) : (
        props.children
      )}
    </components.Menu>
  )
}
export default MenuCategory
