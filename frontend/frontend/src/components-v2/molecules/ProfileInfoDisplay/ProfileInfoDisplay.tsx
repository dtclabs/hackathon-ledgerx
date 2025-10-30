import React, { FC } from 'react'
import Image from 'next/legacy/image'
import Avvvatars from 'avvvatars-react'
import { trimAndEllipsis } from '@/utils-v2/string-utils'
import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'
import { WalletAddressCopy, ILinkProps } from '../WalletAddressCopy'
import ContactIcon from '@/public/svg/icons/contact-unknown-avatar.svg'

interface IChildProps {
  children: React.ReactNode
  classNames?: string
}

interface IAvatarProps {
  name?: string
}

interface ProfileInfoDisplayWithChildren extends React.FC<IChildProps> {
  Info: InfoWithChildren
  Avatar?: React.FC<IAvatarProps>
}

interface InfoWithChildren extends React.FC<IChildProps> {
  Name?: React.FC<ITypographyProps>
  Address?: React.FC<ILinkProps & Partial<ITypographyProps>>
}

export const ProfileInfoDisplay: ProfileInfoDisplayWithChildren = ({ children }) => (
  <div className="flex flex-row items-center gap-3">{children}</div>
)

const Info: InfoWithChildren = ({ children, classNames }) => (
  <div className={`flex flex-col gap-1 ${classNames}`}>{children}</div>
)

ProfileInfoDisplay.Info = Info

ProfileInfoDisplay.Avatar = ({ name }) =>
  name && name !== '' ? (
    <Avvvatars value={name} size={28} />
  ) : (
    <Image src={ContactIcon} alt="contact-icon" height={28} width={28} />
  )

Info.Address = ({ address, blockExplorer, ...rest }) => (
  <WalletAddressCopy address={address} {...rest}>
    <WalletAddressCopy.Link blockExplorer={blockExplorer} isMultiple={false} address={address} />
    <WalletAddressCopy.Copy address={address} />
  </WalletAddressCopy>
)
Info.Name = ({ children, ...rest }) => <Typography {...rest}>{children}</Typography>

export default ProfileInfoDisplay
