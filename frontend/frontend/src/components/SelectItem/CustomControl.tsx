import searchIcon from '@/public/svg/search-md-grey.svg'
import Image from 'next/legacy/image'
import { components, ControlProps } from 'react-select'
import { IFormatOptionLabel } from './FormatOptionLabel'

const CustomControl = (props: ControlProps<IFormatOptionLabel>) => (
  <components.Control {...props}>
    <Image src={searchIcon} width={16} height={16} /> {props.children}
  </components.Control>
)
export default CustomControl
