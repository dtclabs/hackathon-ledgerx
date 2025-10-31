import Creatable from 'react-select/creatable'
import commonSelectConfig, { IBaseDropdownProps } from '../BaseDropdown/base-config'

const CreateableDropdown: React.FC<IBaseDropdownProps> = (props) => {
  const selectContainerClassName = 'relative w-full'
  return (
    <div className={selectContainerClassName}>
      <Creatable {...commonSelectConfig(props)} />
    </div>
  )
}

export default CreateableDropdown
