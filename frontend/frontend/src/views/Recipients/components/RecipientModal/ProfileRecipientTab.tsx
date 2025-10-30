/* eslint-disable react/no-array-index-key */
import Typography from '@/components-v2/atoms/Typography'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import shareIcon from '@/public/svg/Share.svg'
import { EContactType, IRecipientAddress, IRecipientContact } from '@/slice/contacts/contacts.types'
import { capitalize } from 'lodash'
import Image from 'next/legacy/image'
import React from 'react'

interface IProfileRecipientTab {
  contactName: string
  organizationName: string
  organizationAddress: string
  recipientType: EContactType
  recipientContacts: IRecipientContact[]
  recipientAddresses: IRecipientAddress[]
  getImageToken: any
  getSelectToken: any
  getSelectChain: any
  supportedChains: any[]
}

function ProfileRecipientTab({
  recipientContacts,
  recipientType,
  recipientAddresses,
  organizationAddress,
  organizationName,
  contactName,
  getImageToken,
  getSelectToken,
  getSelectChain,
  supportedChains
}: IProfileRecipientTab) {
  return (
    (recipientType === EContactType.individual && (
      <div className="text-base font-medium text-dashboard-sub">
        <div className="flex items-center pb-6 border-b border-dashboard-border">
          <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
            Full Name
          </Typography>
          <Typography variant="body1" styleVariant="medium" classNames=" flex-1 truncate">
            {contactName}
          </Typography>
        </div>
        {recipientContacts &&
          recipientContacts.map(
            (contact, index) =>
              contact.content !== '' && (
                <div key={index} className="border-b border-dashboard-border py-6">
                  <div className="flex items-center">
                    <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                      {contact.contactProvider && contact.contactProvider.name}
                    </Typography>
                    <Typography variant="body1" styleVariant="medium" classNames="flex-1 truncate">
                      {contact.content}
                      {/* <button type="button" className="ml-2">
                      <Image src={shareIcon} alt="Redirect" />
                    </button> */}
                    </Typography>
                  </div>{' '}
                </div>
              )
          )}

        {recipientAddresses &&
          recipientAddresses.map(
            (wallet) =>
              wallet.address !== '' && (
                <div key={wallet.id} className="mt-6">
                  <div className="flex items-center mb-6">
                    <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                      {capitalize(wallet?.blockchainId)} Wallet
                    </Typography>
                    <div className="text-dashboard-main flex items-center w-2/3 gap-3">
                      <div className="flex items-center gap-2 max-w-[146px] min-w-[80px]">
                        <img src={wallet?.cryptocurrency?.image?.thumb} alt="logo" className="h-5 w-5 " />
                        <Typography variant="body2" styleVariant="medium">
                          {wallet?.cryptocurrency?.symbol}
                        </Typography>
                      </div>
                      <div className="border-l border-grey-201 h-4 mx-2" />
                      <WalletAddress split={0} address={wallet?.address} color="dark" variant="body1">
                        <WalletAddress.Link
                          address={wallet?.address}
                          isMultiple={false}
                          blockExplorer={
                            supportedChains?.find((_chain) => _chain.id === wallet.blockchainId)?.blockExplorer
                          }
                        />
                        <WalletAddress.Copy address={wallet?.address} />
                      </WalletAddress>
                    </div>
                  </div>
                </div>
              )
          )}
      </div>
    )) ||
    (recipientType === EContactType.organization && (
      <div className="text-base font-medium text-dashboard-sub">
        {organizationName !== '' && (
          <div className="flex items-center pb-6">
            <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
              Organisation Name
            </Typography>
            <Typography variant="body1" styleVariant="medium" classNames="flex-1 truncate">
              {organizationName}
            </Typography>
          </div>
        )}
        {organizationAddress !== '' && (
          <div className="flex items-center pb-6 border-dashboard-border">
            <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
              Organisation Mailing Address
            </Typography>
            <Typography variant="body1" styleVariant="medium" classNames="flex-1 truncate">
              {organizationAddress}
            </Typography>
          </div>
        )}

        <div className="border-y border-dashboard-border pt-6">
          <div className="flex items-center mb-6">
            <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
              Organisation’s Contact Person
            </Typography>
            <Typography variant="body1" styleVariant="medium" classNames="flex-1 truncate">
              {contactName}
              {/* <button type="button" className="ml-2">
              <Image src={shareIcon} alt="Redirect" />
            </button> */}
            </Typography>
          </div>
          {recipientContacts &&
            recipientContacts
              .filter((item) => item.content !== '')
              .map((contact, index) => (
                <div key={index} className="flex items-center mb-6">
                  <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                    {contact.contactProvider.name}
                  </Typography>
                  <Typography variant="body1" styleVariant="medium" classNames=" flex-1 truncate">
                    {contact.content}
                    {/* <button type="button" className="ml-2">
                      <Image src={shareIcon} alt="Redirect" />
                    </button> */}
                  </Typography>
                </div>
              ))}
        </div>
        {recipientAddresses &&
          recipientAddresses
            .filter((item) => item.address !== '')
            .map((wallet, index) => (
              <div key={index} className="mt-6">
                <div className="flex items-center mb-6">
                  <Typography variant="body1" styleVariant="medium" classNames="w-1/3 max-w-[300px]">
                    {capitalize(wallet?.blockchainId)} Wallet
                  </Typography>
                  <div className="text-dashboard-main flex items-center w-2/3 gap-3">
                    <div className="flex items-center gap-2 max-w-[146px] min-w-[80px]">
                      <img src={wallet?.cryptocurrency?.image?.thumb} alt="logo" className="h-5 w-5 " />
                      <Typography variant="body2" styleVariant="medium">
                        {wallet?.cryptocurrency?.symbol}
                      </Typography>
                    </div>
                    <div className="border-l border-grey-201 h-4 mx-2" />
                    <WalletAddress split={0} address={wallet?.address} color="dark" variant="body1">
                      <WalletAddress.Link
                        address={wallet?.address}
                        isMultiple={false}
                        blockExplorer={
                          supportedChains?.find((_chain) => _chain.id === wallet.blockchainId)?.blockExplorer
                        }
                      />
                      <WalletAddress.Copy address={wallet?.address} />
                    </WalletAddress>
                  </div>
                </div>
              </div>
            ))}
      </div>
    ))
  )
}

export default ProfileRecipientTab
