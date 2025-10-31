import Button from '@/components-v2/atoms/Button'
import { components } from 'react-select'

const CustomDropdownMenu = (props) => (
  <>
    <components.MenuList {...props}>{props.children}</components.MenuList>
    <div className="w-full p-3 border-t border-dashboard-border-200">
      <Button
        variant="whiteWithBlackBorder"
        classNames="text-[0.75rem] w-full"
        onClick={props.onCreateGroup}
        height={32}
        label="Create New Wallet Group"
      />
    </div>
  </>
)
export default CustomDropdownMenu
