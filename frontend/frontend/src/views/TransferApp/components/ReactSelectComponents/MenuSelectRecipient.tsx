import Typography from '@/components-v2/atoms/Typography'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { components, MenuProps } from 'react-select'

const MenuSelectRecipient = (props: MenuProps<IFormatOptionLabel>, onClick: () => void) => (
  <components.Menu {...props}>
    <Typography classNames="!text-[#98A2B3] px-4 pt-2 pb-1" styleVariant="medium" variant="caption">
      Select a recipient
    </Typography>
    {props.children}
    <div className="m-1">
      <button
        type="button"
        onClick={onClick}
        className="flex justify-between items-center border border-dashboard-border-200 rounded text-xs px-4 py-3 w-full"
      >
        <Typography color="dark" styleVariant="semibold" classNames="text-right" variant="caption">
          Create New Recipient Profile
        </Typography>
        {/* <div className="flex items-center gap-1">
          <div className="w-[22px] h-5 shadow-keyboard rounded flex items-center justify-center">
            <img src="/svg/command.svg" alt="command" />
          </div>
          <div className="font-inter text-dashboard-sub font-semibold rounded shadow-keyboard w-[22px] h-5">N</div>
        </div> */}
      </button>
    </div>
  </components.Menu>
)
export default MenuSelectRecipient
