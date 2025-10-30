import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import speechWhite from '@/public/svg/icons/speech-bubble.svg'
import speechBlack from '@/public/svg/icons/speech-bubble-black.svg'
import speechRed from '@/public/svg/icons/speech-bubble-red.svg'
import Button from './index'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'

export default {
  title: 'Atoms/Button',
  component: Button
} as ComponentMeta<typeof Button>

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const Black48 = Template.bind({})
Black48.args = {
  label: 'Label',
  height: 48,
  variant: 'black',
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const Black48Disabled = Template.bind({})
Black48Disabled.args = {
  label: 'Label',
  height: 48,
  variant: 'black',
  disabled: true,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const Black40 = Template.bind({})
Black40.args = {
  label: 'Label',
  height: 40,
  variant: 'black',
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const Black32 = Template.bind({})
Black32.args = {
  label: 'Label',
  height: 32,
  variant: 'black',
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const Black24 = Template.bind({})
Black24.args = {
  label: 'Label',
  height: 24,
  variant: 'black',
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const BlackOnlyIcon = Template.bind({})
BlackOnlyIcon.args = {
  height: 48,
  variant: 'black',
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const BlackTrailingIconWithInputWidth = Template.bind({})
BlackTrailingIconWithInputWidth.args = {
  height: 48,
  label: 'Label',
  variant: 'black',
  width: 'w-[150px]',
  trailingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const Grey48 = Template.bind({})
Grey48.args = {
  label: 'Label',
  variant: 'grey',
  height: 48,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Grey48Disabled = Template.bind({})
Grey48Disabled.args = {
  label: 'Label',
  variant: 'grey',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Grey40 = Template.bind({})
Grey40.args = {
  label: 'Label',
  variant: 'grey',
  height: 40,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Grey32 = Template.bind({})
Grey32.args = {
  label: 'Label',
  variant: 'grey',
  height: 32,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Grey24 = Template.bind({})
Grey24.args = {
  label: 'Label',
  variant: 'grey',
  height: 24,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost48 = Template.bind({})
Ghost48.args = {
  label: 'Label',
  variant: 'ghost',
  height: 48,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost48Disabled = Template.bind({})
Ghost48Disabled.args = {
  label: 'Label',
  variant: 'ghost',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost40 = Template.bind({})
Ghost40.args = {
  label: 'Label',
  variant: 'ghost',
  height: 40,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost32 = Template.bind({})
Ghost32.args = {
  label: 'Label',
  variant: 'ghost',
  height: 32,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost24 = Template.bind({})
Ghost24.args = {
  label: 'Label',
  variant: 'ghost',
  height: 24,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const Ghost24OnlyIcon = Template.bind({})
Ghost24OnlyIcon.args = {
  variant: 'ghost',
  height: 24,
  leadingIcon: <Image src={leftArrow} className="rotate-90 py-[20px]" height={14} width={14} />
}

export const WhiteWithBlackBorder48 = Template.bind({})
WhiteWithBlackBorder48.args = {
  label: 'Label',
  variant: 'whiteWithBlackBorder',
  height: 48,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const WhiteWithBlackBorder48Disabled = Template.bind({})
WhiteWithBlackBorder48Disabled.args = {
  label: 'Label',
  variant: 'whiteWithBlackBorder',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const whiteWithBlackBorder40 = Template.bind({})
whiteWithBlackBorder40.args = {
  label: 'Label',
  variant: 'whiteWithBlackBorder',
  height: 40,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const whiteWithBlackBorder32 = Template.bind({})
whiteWithBlackBorder32.args = {
  label: 'Label',
  variant: 'whiteWithBlackBorder',
  height: 32,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const whiteWithBlackBorder24 = Template.bind({})
whiteWithBlackBorder24.args = {
  label: 'Label',
  variant: 'whiteWithBlackBorder',
  height: 24,
  leadingIcon: <Image src={speechBlack} alt="document" width={14} height={14} />
}

export const redfilled48 = Template.bind({})
redfilled48.args = {
  label: 'Label',
  variant: 'redfilled',
  height: 48,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const redfilled48Disabled = Template.bind({})
redfilled48Disabled.args = {
  label: 'Label',
  variant: 'redfilled',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const redfilled40 = Template.bind({})
redfilled40.args = {
  label: 'Label',
  variant: 'redfilled',
  height: 40,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const redfilled32 = Template.bind({})
redfilled32.args = {
  label: 'Label',
  variant: 'redfilled',
  height: 32,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const redfilled24 = Template.bind({})
redfilled24.args = {
  label: 'Label',
  variant: 'redfilled',
  height: 24,
  leadingIcon: <Image src={speechWhite} alt="document" width={14} height={14} />
}

export const redOutlined48 = Template.bind({})
redOutlined48.args = {
  label: 'Label',
  variant: 'redOutlined',
  height: 48,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const redoutlined48Disabled = Template.bind({})
redoutlined48Disabled.args = {
  label: 'Label',
  variant: 'redOutlined',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const redOutlined40 = Template.bind({})
redOutlined40.args = {
  label: 'Label',
  variant: 'redOutlined',
  height: 40,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const redOutlined32 = Template.bind({})
redOutlined32.args = {
  label: 'Label',
  variant: 'redOutlined',
  height: 32,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const redOutlined24 = Template.bind({})
redOutlined24.args = {
  label: 'Label',
  variant: 'redOutlined',
  height: 24,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const ghostRed48 = Template.bind({})
ghostRed48.args = {
  label: 'Label',
  variant: 'ghostRed',
  height: 48,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const ghostRed48Disabled = Template.bind({})
ghostRed48Disabled.args = {
  label: 'Label',
  variant: 'ghostRed',
  height: 48,
  disabled: true,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const ghostRed40 = Template.bind({})
ghostRed40.args = {
  label: 'Label',
  variant: 'ghostRed',
  height: 40,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const ghostRed32 = Template.bind({})
ghostRed32.args = {
  label: 'Label',
  variant: 'ghostRed',
  height: 32,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}

export const ghostRed24 = Template.bind({})
ghostRed24.args = {
  label: 'Label',
  variant: 'ghostRed',
  height: 24,
  leadingIcon: <Image src={speechRed} alt="document" width={14} height={14} />
}
