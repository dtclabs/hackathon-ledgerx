// import React, { useState } from 'react'
// import { ComponentStory, ComponentMeta } from '@storybook/react'

// import SideMenuPush from './index'

// export default {
//   title: 'Molecules/Side Menu (Push)',
//   component: SideMenuPush,
//   argTypes: {
//     backgroundColor: { control: 'color' }
//   }
// } as ComponentMeta<typeof SideMenuPush>

// const Template: ComponentStory<typeof SideMenuPush> = (args) => {

//   return (
//     <div className="flex">

//         {/* <SideMenuPush width={400} isOpen={isOpen} {...args}>
//           <SideMenuPush.Header isOpen>
//             <SideMenuPush.Header.Title title="Transaction Details" />
//             <SideMenuPush.Header.CloseButton />
//           </SideMenuPush.Header>
//           <SideMenuPush.Content>
//             <div>THIS IS THE CONTENT</div>
//           </SideMenuPush.Content>
//         </SideMenuPush> */}

//     </div>
//   )
// }

// export const Default = Template.bind({})
// Default.args = {
//   isOpen: false
// }

import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { SideMenu } from '.'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import BlackLock from '@/public/svg/icons/black-lock-icon.svg'

const ICON_MAP = { AddIcon, BlackLock, undefined }

export default {
  title: 'Molecules/Side Menu',
  component: SideMenu,
  args: {
    isOpen: false
  },
  argTypes: {
    // value: {
    //   type: 'string',
    //   description: 'Value of input',
    //   control: 'text'
    // },
    // placeholder: {
    //   type: 'string',
    //   description: 'Text shown when there is no value',
    //   control: 'text'
    // },
    // size: {
    //   description: 'Size of input',
    //   options: ['sm', 'md', 'lg'],
    //   control: { type: 'radio' }
    // },
    // trailingIcon: {
    //   description: 'Add an icon to end of Input',
    //   name: 'Trailing Icon',
    //   options: Object.keys(ICON_MAP),
    //   mapping: ICON_MAP,
    //   control: {
    //     type: 'select',
    //     labels: {
    //       undefined: 'None',
    //       AddIcon: 'Add Icon',
    //       BlackLock: 'Lock Icon'
    //     }
    //   }
    // },
    // leadingIcon: {
    //   name: 'Leading Icon',
    //   description: 'Add an icon to start of Input',
    //   options: Object.keys(ICON_MAP),
    //   mapping: ICON_MAP,
    //   control: {
    //     type: 'select',
    //     labels: {
    //       undefined: 'None',
    //       AddIcon: 'Add Icon',
    //       BlackLock: 'Lock Icon'
    //     }
    //   }
    // }
  }
} as Meta<typeof SideMenu>

const Template: StoryFn<typeof SideMenu> = (args) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-red-500 h-[calc(100vh-100px)]">
      <button type="button" onClick={() => setMenuOpen(true)}>
        Open Menu
      </button>
      <SideMenu withOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} width="1/3">
        asdaada
      </SideMenu>

      {/* Rest of the page content */}
    </div>
  )
}

export const Default = Template.bind({})
