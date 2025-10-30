import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Breadcrumb from './index'
import Link from 'next/link'

export default {
  title: 'Atoms/Breadcrumb',
  component: Breadcrumb,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Breadcrumb>

const items = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' }
]

const Template: ComponentStory<typeof Breadcrumb> = (args) => (
  <Breadcrumb>
    {items.map(({ to, label }) => (
      <Link key={to} href={to} legacyBehavior>
        {label}
      </Link>
    ))}
  </Breadcrumb>
)

export const BreadcrumbExample = Template.bind({})
