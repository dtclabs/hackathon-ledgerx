/* eslint-disable no-param-reassign */
import { AppState } from '@/state'
import { createSelector } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
// import { IContactSliceState } from './contacts-slice'
// TODO - Fix AppState
const selectSelf = (state: AppState) => state.contacts

export const selectContactsMapId = createSelector(selectSelf, (state: any) => {
  const contacts = state?.contacts?.items ?? []
  return contacts.reduce((result, item) => {
    result[item.publicId] = item
    return result
  }, {})
})

export const selectContactMapWalletAddress = createSelector(selectSelf, (state: any) => {
  const contacts = state?.contacts?.items ?? []

  const contactAddressMap = {}
  contacts.forEach((resource) => {
    if (resource.recipientAddresses && resource.recipientAddresses.length > 0) {
      resource.recipientAddresses.forEach((address) => {
        // Convert address to lowercase for consistency
        const recipientAddress = address.address.toLowerCase()
        const isValidEthereumAddress = ethers.utils.isAddress(recipientAddress)
        // Check if the recipient address is a valid Ethereum address
        if (isValidEthereumAddress) {
          // Add the resource to the addressMap with the recipient address as the key
          contactAddressMap[recipientAddress] = resource
        }
      })
    }
  })

  return contactAddressMap
})

export const selectContactMapAddressId = createSelector(selectSelf, (state: any) => {
  const contacts = state?.contacts?.items ?? []

  const contactAddressMap = {}
  contacts.forEach((resource) => {
    if (resource.recipientAddresses && resource.recipientAddresses.length > 0) {
      resource.recipientAddresses.forEach((address) => {
        // Convert address to lowercase for consistency
        const recipientAddress = address.address.toLowerCase()
        const isValidEthereumAddress = ethers.utils.isAddress(recipientAddress)
        // Check if the recipient address is a valid Ethereum address
        if (isValidEthereumAddress) {
          // Add the resource to the addressMap with the recipient address as the key
          contactAddressMap[address.publicId] = {
            id: address.id,
            contactPublicId: resource.publicId,
            contactName: resource.contactName ?? null,
            contactOrganisationId: resource.organisation?.publicId,
            contactOrganizationAddress: resource.organizationAddress ?? null,
            contactOrganizationName: resource.organizationName ?? null,
            addressPublicId: address.publicId,
            address: address.address
          }
        }
      })
    }
  })

  return contactAddressMap
})

export const selectContactAddressMap = createSelector(selectSelf, (state: any) => {
  const contacts = state?.contacts?.items ?? []

  const contactAddressMap = {}
  contacts.forEach((resource) => {
    if (resource.recipientAddresses && resource.recipientAddresses.length > 0) {
      resource.recipientAddresses.forEach((address) => {
        // Convert address to lowercase for consistency
        const recipientAddress = address.address.toLowerCase()
        const isValidEthereumAddress = ethers.utils.isAddress(recipientAddress)
        // Check if the recipient address is a valid Ethereum address
        if (isValidEthereumAddress) {
          // Add the resource to the addressMap with the recipient address as the key
          contactAddressMap[recipientAddress] = resource
        }
      })
    }
  })

  return contactAddressMap
})

export const selectContactAddressIdMap = createSelector(selectSelf, (state: any) => {
  const contacts = state?.contacts?.items ?? []

  const contactAddressMap = {}
  contacts.forEach((resource) => {
    if (resource.recipientAddresses && resource.recipientAddresses.length > 0) {
      resource.recipientAddresses.forEach((address) => {
        // Convert address to lowercase for consistency
        const recipientAddress = address.address.toLowerCase()
        const isValidEthereumAddress = ethers.utils.isAddress(recipientAddress)
        // Check if the recipient address is a valid Ethereum address
        if (isValidEthereumAddress) {
          // Add the resource to the addressMap with the recipient address as the key
          contactAddressMap[address.publicId] = {
            id: address.id,
            contactPublicId: resource.publicId,
            contactName: resource.contactName ?? null,
            contactOrganisationId: resource.organisation?.publicId,
            contactOrganizationAddress: resource.organizationAddress ?? null,
            contactOrganizationName: resource.organizationName ?? null,
            addressPublicId: address.publicId,
            address: address.address
          }
        }
      })
    }
  })

  return contactAddressMap
})

export const bankCurrenciesMapSelector = createSelector(selectSelf, (state) =>
  state.bankList?.reduce((cur, acc) => {
    cur[acc.id] = acc.currency
    return cur
  }, {})
)
