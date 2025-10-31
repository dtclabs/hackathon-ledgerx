import { useLazyGetCollectionQuery, useLazyGetNftQuery } from '@/api-v2/nft/nfts-api'
import { INft, INftCollection } from '@/api-v2/nft/nfts.type'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useEffect, useImperativeHandle, useState } from 'react'
import { DetailType, parseCollection } from '../../nft-utils'
import CollectionDetail from './CollectionDetail'
import { CollectionDetailLoading, NftDetailLoading } from './DetailLoading'
import NftDetail from './NftDetail'

const DetailContent = ({
  selectedNft,
  selectedCollection,
  chainIcons,
  setDetailName,
  setShowBackBtn,
  isClose,
  detailRef
}: {
  selectedNft: any
  selectedCollection: any
  chainIcons: any
  isClose: boolean
  setShowBackBtn: (b: boolean) => void
  setDetailName: (name: string) => void
  detailRef: any
}) => {
  const organizationId = useOrganizationId()
  const supportedChains = useAppSelector(supportedChainsSelector)

  const [detailType, setDetailType] = useState<DetailType>(null)
  const [nft, setNft] = useState<INft>(null)
  const [collection, setCollection] = useState<INftCollection>(null)

  const [triggerGetNft, { isFetching: nftFetching }] = useLazyGetNftQuery()
  const [triggerGetCollection, { isFetching: collectionFetching }] = useLazyGetCollectionQuery()

  useEffect(() => {
    if (isClose) {
      setDetailType(null)

      setNft(null)
      setCollection(null)
    }
  }, [isClose])

  useEffect(() => {
    if (selectedNft) {
      setDetailType(DetailType.NFT)
      setDetailName(selectedNft?.name)
    } else if (!selectedNft && selectedCollection) {
      setDetailType(DetailType.COLLECTION)
      setDetailName(selectedCollection?.name)
    }
  }, [selectedNft, selectedCollection])

  useEffect(() => {
    if (selectedNft) {
      if (selectedNft?.collectionSimplified?.id) {
        // select nft in nft list
        setNft(selectedNft)
        triggerGetCollection({ organizationId, id: selectedNft.collectionSimplified.id })
          .unwrap()
          .then((_collection) => {
            const parsedCollection = parseCollection(_collection, supportedChains)
            setCollection(parsedCollection)
          })
      } else {
        // select nft on collection list (don't have full info)
        triggerGetNft({ organizationId, id: selectedNft.id })
          .unwrap()
          .then((_nft) => {
            setNft(_nft)
          })
      }
    }
  }, [selectedNft])

  useEffect(() => {
    if (selectedCollection) {
      if (selectedCollection?.nftSimplifiedList) {
        // select collection in collection list
        setCollection(selectedCollection)
      } else {
        // select collection in nft list
        triggerGetCollection({ organizationId, id: selectedCollection.id })
          .unwrap()
          .then((_collection) => {
            const parsedCollection = parseCollection(_collection, supportedChains)
            setCollection(parsedCollection)
          })
      }
    }
  }, [selectedCollection])

  const handleClickCollection = () => {
    setDetailType(DetailType.COLLECTION)
    setShowBackBtn(false)
    if (collection?.name) setDetailName(collection?.name)
  }

  const handleClickNFT = async (_nft) => {
    triggerGetNft({ organizationId, id: _nft.id })
      .unwrap()
      .then((_nftRes) => {
        setNft(_nftRes)
        setDetailType(DetailType.NFT)
        setShowBackBtn(true)
        setDetailName(_nftRes?.name)
      })
  }

  // TODO - Check we need this
  useImperativeHandle(detailRef, () => ({
    backToCollection() {
      handleClickCollection()
    }
  }))

  // -----view-----
  if (nftFetching) return <NftDetailLoading />
  if (collectionFetching) return <CollectionDetailLoading />

  if (detailType === DetailType.NFT && nft)
    return (
      <NftDetail
        nft={nft}
        chainIcons={chainIcons}
        contractAddress={collection.contractAddresses?.[0]?.contractAddress}
        onClickCollection={handleClickCollection}
      />
    )

  if (detailType === DetailType.COLLECTION && collection)
    return <CollectionDetail collection={collection} chainIcons={chainIcons} onClickNft={handleClickNFT} />

  return <NftDetailLoading />
}

export default DetailContent
