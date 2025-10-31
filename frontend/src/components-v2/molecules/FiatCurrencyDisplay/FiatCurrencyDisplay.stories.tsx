import React from 'react'
import { StoryFn, Meta } from '@storybook/react'
import { FiatCurrencyDisplay } from '.'

export default {
  title: 'Molecules/Fiat Currency Display',
  component: FiatCurrencyDisplay,
  args: {
    fiatAmount: '1000000000',
    iso: 'US',
    currencySymbol: '$'
  },
  argTypes: {
    styleVariant: {
      table: {
        disable: true
      }
    },
    color: {
      table: {
        disable: true
      }
    },
    classNames: {
      table: {
        disable: true
      }
    },
    href: {
      table: {
        disable: true
      }
    },
    target: {
      table: {
        disable: true
      }
    },
    rel: {
      table: {
        disable: true
      }
    },
    variant: {
      table: {
        disable: true
      }
    },
    fiatAmount: {
      type: 'string',
      description: 'Fiat amount',
      control: 'text'
    },
    iso: {
      description: 'ISO Setting',
      options: ['US', 'SG', 'PH', 'ID', 'MY', 'TH', 'VN'],
      control: { type: 'radio' }
    }
  }
} as Meta<typeof FiatCurrencyDisplay>

const Template: StoryFn<typeof FiatCurrencyDisplay> = (args) => (
  <div className="p-4">
    <FiatCurrencyDisplay {...args} />
  </div>
)

export const Default = Template.bind({})
