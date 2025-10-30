/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useContext, useEffect } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import Button, { IButtonProps } from '@/components-v2/atoms/Button'
import CloseIconHover from '@/public/svg/icons/close-icon-hover.svg'
import Image from 'next/legacy/image'
import { BaseCtx } from './state-ctx'

interface IBasicModalProps {
  children: React.ReactNode
  width?: string
  provider: any
  classNames?: string
  zIndex?: string
}

interface ChildProps {
  children: React.ReactNode
  extendedClass?: string
}

interface IBaseBtnModalProps {
  label: string
  disabled?: boolean
  onClick?: (e: any) => void
  type?: string
  classNames?: string
  variant?: IButtonProps['variant']
  loadingWithLabel?: boolean
}

interface BaseModalChildren extends React.FC<IBasicModalProps> {
  Header: HeaderWithChildren
  Body: BodyWithChildren
  Footer: FooterWithChildren
}

interface HeaderWithChildren extends React.FC<ChildProps> {
  HeaderIcon?: any
  Title: any
  CloseButton?: any
}

interface BodyWithChildren extends React.FC<ChildProps> {
  extendedClass?: string
}

interface FooterWithChildren extends React.FC<ChildProps> {
  PrimaryCTA?: React.FC<IBaseBtnModalProps>
  SecondaryCTA?: React.FC<IBaseBtnModalProps>
  ErrorCTA?: React.FC<IBaseBtnModalProps>
}

const BaseModal: BaseModalChildren = ({ children, width, provider: { state, dispatch }, classNames, zIndex }) => (
  <BaseCtx.Provider value={{ state, dispatch }}>
    <div
      className={`${
        state.isOpen
          ? 'fixed w-full h-full max-h-full inset-0 flex justify-center items-center bg-gray-700 bg-opacity-70  overflow-x-hidden overflow-y-auto'
          : 'hidden'
      } ${zIndex || 'z-50'}`}
    >
      <div className={`bg-white rounded-lg shadow-lg  ${width ? `w-[${width}px]` : ''} ${classNames} `}>{children}</div>
    </div>
  </BaseCtx.Provider>
)

const ModalHeader: HeaderWithChildren = ({ children, extendedClass }) => (
  <div className={`w-full flex pt-8 px-8  items-center  ${extendedClass}`}>{children}</div>
)

const HeaderIcon: any = ({ icon, className, imageSize }) => {
  const { dispatch } = useContext(BaseCtx)
  useEffect(() => {
    dispatch({ type: 'SET_IS_ICON_VISIBLE', payload: true })
  }, [])

  return (
    <Image
      className={`cursor-pointer ${className}`}
      src={icon ?? CloseIconHover}
      height={imageSize || 40}
      width={imageSize || 40}
    />
  )
}
const ModalTitle = ({ children, className, wraperClassName }) => {
  const { state } = useContext(BaseCtx)
  return (
    <div className="flex grow items-center">
      <Typography
        classNames={`mr-auto ${state.isIconVisible ? 'pl-6' : ''} ${className} ${wraperClassName}`}
        variant="heading2"
      >
        {children}
      </Typography>
    </div>
  )
}

const ModalCloseButton = ({ onClose, disabled }) => {
  const { dispatch, state } = useContext(BaseCtx)

  const handleOnClick = () => {
    if (disabled) return
    if (onClose) {
      onClose()
    }
    dispatch({ type: 'SET_IS_OPEN', payload: false })
  }

  return (
    <div className="flex items-center ">
      <Button
        height={40}
        variant="transparent"
        onClick={handleOnClick}
        leadingIcon={<Image src={CloseIconHover} />}
        className={`h-[40px] rounded-full ${disabled ? 'opacity-70' : ''}`}
        disabled={disabled}
      />
    </div>
  )
}

const ModalContent: BodyWithChildren = ({ children, extendedClass }) => {
  const { state } = useContext(BaseCtx)
  return (
    <div className={`modal-body ${state.isIconVisible ? 'pl-10' : 'pl-8'} mt-4 pb-6 pr-8 ${extendedClass}`}>
      {children}
    </div>
  )
}

const ModalFooter: FooterWithChildren = ({ children, extendedClass }) => (
  <div className={`flex flex-row justify-end gap-4 pt-8 border-t pl-8 pr-8 pb-8 ${extendedClass}`}>{children}</div>
)

const ModalPrimaryCTA = ({ variant = 'black', ...props }) => (
  // @ts-ignore
  <Button classNames="w-full" {...props} height={48} variant={variant} />
)

const ModalSecondaryCTA = ({ ...props }) => <Button {...props} height={48} variant="grey" />

const ModalErrorCTA = ({ ...props }) => <Button {...props} height={48} variant="redfilled" />

BaseModal.Header = ModalHeader
ModalHeader.Title = ModalTitle
ModalHeader.CloseButton = ModalCloseButton
ModalHeader.HeaderIcon = HeaderIcon

BaseModal.Body = ModalContent

BaseModal.Footer = ModalFooter
ModalFooter.PrimaryCTA = ModalPrimaryCTA
ModalFooter.SecondaryCTA = ModalSecondaryCTA
ModalFooter.ErrorCTA = ModalErrorCTA

export default BaseModal
