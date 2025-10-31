import React, { useState } from 'react'
import useFreeContext from '@/hooks/useFreeContext'
import { ILink } from '../../ReceivePayment'
import { toShort } from '@/utils/toShort'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import CopyIcon from '@/assets/svg/copy.svg'
import Image from 'next/legacy/image'
import Delete from '@/public/svg/TrashRed.svg'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'

interface ILinkLists {
  link: ILink
  setShowModal: any
  setLink: React.Dispatch<React.SetStateAction<ILink>>
}

const LinkItem: React.FC<ILinkLists> = ({ link, setLink, setShowModal }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link.link)
    toast.success('Payment link copied')
  }
  return (
    <div className="flex items-center border border-grey-200 p-4 rounded-lg mb-2 w-full">
      <div className="w-[60px] flex items-center gap-2">
        <img src={link?.token?.image?.small} alt="token" width={14} height={14} />
        <Typography variant="body2">{link?.token?.symbol}</Typography>
      </div>
      <DividerVertical height="h-5" space="mx-6" />
      <Typography variant="body2" classNames="w-fit">
        {toShort(link?.address, 5, 4)}
      </Typography>
      <DividerVertical height="h-5" space="mx-4" />
      <Typography variant="body2" classNames="truncate flex-1">
        {link?.link}
      </Typography>
      <DividerVertical height="h-5" space="mx-4" />
      <div className="w-[60px] flex items-center gap-4">
        <Image src={CopyIcon} width={14} height={14} onClick={handleCopyLink} className="cursor-pointer" />
        <Image
          src={Delete}
          width={14}
          height={14}
          onClick={() => {
            setLink(link)
            setShowModal(true)
          }}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

export default LinkItem
