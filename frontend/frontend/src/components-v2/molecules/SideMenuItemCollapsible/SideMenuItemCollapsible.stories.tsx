/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { SideMenuItemCollapsible as DropdownAccordion } from '.'
import PaymentIcon from '@/public/svg/sidebar-icon/payment-icon.svg'

export default {
  title: 'Molecules/Side Menu Item Collapsible',
  component: DropdownAccordion,
  args: {},
  argTypes: {}
} as Meta<typeof DropdownAccordion>

const SAMPLE_ROUTE = [
  {
    title: 'Transact',
    icon: 'NewTransferIcon',
    routes: [
      {
        active: true,
        icon: 'NewTransferIcon',
        title: 'Payments',
        match: 'Payments',
        path: '',
        children: [
          {
            active: true,
            icon: 'NewTransferIcon',
            title: 'Manage Drafts',
            path: '/transfer',
            match: 'Transfer',
            blacklistRole: ['Employee'],
            description:
              'Overview of your balances, transaction records requiring your attention and other quick actions'
          },
          {
            active: true,
            icon: 'NewTransferIcon',
            title: 'Make Payment',
            path: '/transfer',
            match: 'Transfer',
            blacklistRole: ['Employee'],
            description:
              'Overview of your balances, transaction records requiring your attention and other quick actions'
          }
        ]
      },
      {
        active: true,
        icon: 'PendingApprovalIcon',
        title: 'Pending Approval',
        match: 'Pending Approval',
        path: '/pendingApproval',
        blacklistRole: ['Employee'],
        description: 'Pending Approval for your transactions'
      },
      {
        active: true,
        icon: 'InvoiceIcon',
        title: 'Invoices',
        match: 'Invoices',
        path: '/invoices',
        blacklistRole: ['Employee'],
        description: 'Invoices',
        whitelistEnvironment: ['localhost', 'development', 'staging']
      }
    ]
  }
]

const Template: StoryFn<typeof DropdownAccordion> = (args) => (
  <div className="font-inter w-[150px]">
    {SAMPLE_ROUTE.map((section, index) => (
      <DropdownAccordion childPaths={[]} organizationId="123" currentPage="/chese" key={index} isSidebarOpen id="123">
        <DropdownAccordion.CTA icon={section.icon} text={section.title} />
        <DropdownAccordion.Menu>
          {section.routes.map((route, _index, { length }) => (
            <DropdownAccordion.Item key={_index} path={route.path} index={_index}>
              {route.title}
            </DropdownAccordion.Item>
          ))}
        </DropdownAccordion.Menu>
      </DropdownAccordion>
    ))}
  </div>
)

export const Default = Template.bind({})
