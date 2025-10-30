import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import View, { Content, Body } from './BaseTemplate'

export default {
  title: 'Templates/List View',
  component: View,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof View>


const Template: ComponentStory<typeof View> = (args) => (
  <View>
    <View.Header
      user={{ firstName: '', lastName: '', loginCredentials: '', role: 'Owner' }}
      onClickLogout={() => console.log('LOGOUT')}
      onClickNavigateToProfile={() => console.log('Navigate')}
    />
    <View.Body>
      <Body.Sidebar currentOrg="Hello" orgList={[]} user={{ role: 'Owner' }} />
      <Body.Content>
        {/* <Content.Header>
          <Header.Left>
            <Header.Left.Title>List Wallets</Header.Left.Title>
          </Header.Left>
          <Header.Right>
            <Header.Right.SecondaryCTA label="Secondary CTA" />
            <Header.Right.PrimaryCTA label="Primary CTA" />
          </Header.Right>
        </Content.Header> */}
        {/* <Content.Body>
          ACTUAL DATA FOR PAGE
        </Content.Body> */}
      </Body.Content>
      {/* <Body.Sidebar /> */}
    </View.Body>
  </View>
)

export const Default = Template.bind({})
Default.args = {}

