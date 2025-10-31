import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { FormController } from './index'
import { TextInput } from '../TextInput'
import { FormGroup } from '../FormGroup'
import * as yup from 'yup'
import { useForm, RegisterOptions, SubmitHandler, Controller, FormProvider } from 'react-hook-form'

export default {
  title: 'Molecules/Forms/Form Controller',
  component: FormController,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof FormController>

const schema = yup.object().shape({
  email: yup.string().required('Please enter an email')
})

const Template: ComponentStory<typeof FormController> = (args) => {
  const onSubmit = (data) => {
    console.log('Submitted', data)
  }

  return (
    <FormController onSubmit={onSubmit} validationSchema={schema}>
      <FormGroup id="email" label="Email">
        <TextInput id="email" placeholder="Enter email" onChange={(e) => console.log('LALAL', e)} />
      </FormGroup>
      <FormGroup id="name" label="Name">
        <TextInput id="name" placeholder="Enter Name..." />
      </FormGroup>
    </FormController>
  )
}

export const Default = Template.bind({})
Default.args = {}
