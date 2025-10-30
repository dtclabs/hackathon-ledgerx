import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { BaseTable } from './index'

export default {
  title: 'Molecules/Tables/Base Table',
  component: BaseTable,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof BaseTable>

const Template: ComponentStory<typeof BaseTable> = (args) => (
  <div className="flex font-inter">
    <BaseTable>
      <BaseTable.Header>
       <BaseTable.Header.Row>
          <BaseTable.Header.Row.Cell>hello</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>world</BaseTable.Header.Row.Cell>
          <BaseTable.Header.Row.Cell>hehe</BaseTable.Header.Row.Cell>
       </BaseTable.Header.Row>
      </BaseTable.Header>
      <BaseTable.Body>
        <BaseTable.Body.Row>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
        <BaseTable.Body.Row>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
        <BaseTable.Body.Row>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
          <BaseTable.Body.Row.Cell>sss</BaseTable.Body.Row.Cell>
        </BaseTable.Body.Row>
      </BaseTable.Body>
    </BaseTable>
  </div>
)

export const Default = Template.bind({})
// Default.args = {
//   isSyncing: false,
//   lastUpdated: '5 seconds ago'
// }
