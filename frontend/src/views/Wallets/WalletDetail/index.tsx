import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import Image from 'next/legacy/image'
import { useGetWalletByIdQuery } from '@/slice/wallets/wallet-api'
import Button from '@/components-v2/atoms/Button'
import leftArrow from '@/public/svg/Dropdown.svg'
import Typography from '@/components-v2/atoms/Typography'
import WalletAddressActionButtons from '@/components-v2/molecules/WalletAddressActionButtons'
import { IChainItem, ChainList } from '@/components-v2/molecules/ChainList/ChainList'
import { toShort } from '@/utils/toShort'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { useDebounce } from '@/hooks/useDebounce'
import { addMinutes, parseISO, format } from 'date-fns'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import Loading from '@/components/Loading'
import { Input } from '@/components-v2'
import DeleteSourceModal from '../components/DeleteSourceModal/DeleteSourceModal'
import EditModal from '../components/EditModal/EditModal'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import { useGetAssetsQuery } from '@/api-v2/assets-api'
import redFlag from '@/public/svg/red-flag.svg'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import TabItem from '@/components/TabsComponent/TabItem'
import SafeServiceClient from '@gnosis.pm/safe-service-client'
import { selectSafeUrlMap, selectNetworkRPCMap } from '@/slice/chains/chain-selectors'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { toChecksumAddress } from 'ethereumjs-util'
import { log } from '@/utils-v2/logger'
import { useGetAllContactsQuery } from '@/slice/contacts/contacts-api'
import AddToContactsButton from '@/components-v2/molecules/AddToContactsButton'
import { Alert } from '@/components/Alert'
import AssetItem from './components/AssetItem/index'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { SourceType } from '@/slice/wallets/wallet-types'

export interface IIndividualChainAssetData {
  blockChainId: string
  totalUnits: string
  totalCostBasis: string
  totalCurrentFiatValue: string
}

interface ICryptoCurrencyAddress {
  blockchainId: string
  address: string
  decimal: number
  type: string
}

export interface ICryptoCurrency {
  addresses: ICryptoCurrencyAddress[]
  image: object[]
  name: string
  isVerified: boolean
  publicId: string
  symbol: string
}

export interface IAssetMapData {
  name: string
  symbol: string
  imageUrl: string
  currentFiatPrice: string
  fiatCurrency: string
  individualChainAssetData: IIndividualChainAssetData[]
  cryptocurrency: ICryptoCurrency
}

const SETTING_TABS = [
  {
    key: 'balances',
    name: 'Balances'
  },
  {
    key: 'owners',
    name: 'Owners'
  }
]

const WalletDetail: React.FC = () => {
  const [walletChains, setWalletChains] = useState<IChainItem[]>([])
  const [totalBalance, setTotalBalance] = useState<string>('')
  const netWorkRpc = useAppSelector(selectNetworkRPCMap)
  const [createdAt, setCreatedAt] = useState<string>()
  const [assetMap, setAssetMap] = useState<Map<string, IAssetMapData>>()
  const [safeError, setSafeError] = useState<string>()
  const [visibleAssetMapKeys, setVisibleAssetsMapKey] = useState<string[]>()
  const [showDeleteWalletConfirmationModal, setShowDeleteWalletConfirmationModal] = useState<boolean>(false)
  const [showEditWalletModal, setShowEditWalletModal] = useState<boolean>(false)
  const [isAssetsEmpty, setIsAssetsEmpty] = useState<boolean>(false)
  const [areZeroValueAssetsHidden, setAreZeroValueAssetsHidden] = useState<boolean>(true)
  const [hasZeroValueAssets, setHasZeroValueAssets] = useState<boolean>(false)
  const [searchTermForAssets, setSearchTermForAssets] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(SETTING_TABS[0].key)
  const [safeOwners, setSafeOwners] = useState<string[]>()
  const { debouncedValue: search } = useDebounce(searchTermForAssets, 300)
  const organizationId = useOrganizationId()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const safeServiceUrl = useAppSelector(selectSafeUrlMap)

  const router = useRouter()
  const {
    data: walletDetails,
    isSuccess: isGetWalletDetailsSuccess,
    isFetching: isGetWalletDetailsFetching,
    isLoading
  } = useGetWalletByIdQuery(
    {
      orgId: organizationId,
      walletId: router.query.walletId
    },
    { skip: !router.query.walletId }
  )
  const {
    timezone: timeZonesetting,
    fiatCurrency: fiatCurrencySetting,
    country: countrySetting
  } = useAppSelector(orgSettingsSelector)

  const { data: memberData } = useGetAuthenticatedProfileQuery(
    { orgId: String(organizationId) },
    { skip: !organizationId }
  )

  const {
    data: walletAssets,
    isFetching: isGetAssetsFetching,
    isSuccess: isGetWalletAssetsSuccess
  } = useGetAssetsQuery(
    {
      orgId: organizationId,
      params: {
        nameOrSymbol: search,
        walletIds: [`${router.query.walletId}`]
      }
    },
    { skip: !router.query.walletId }
  )

  const [organizationContacts, setOrganizationContacts] = useState<Map<any, any>>()
  const {
    data: contacts,
    isSuccess: isGetContactsSuccess,
    isFetching
  } = useGetAllContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )

  // Transform assets into a map for quicker access and data transformation
  useEffect(() => {
    if (!isGetAssetsFetching && isGetWalletAssetsSuccess) {
      if (walletAssets.length > 0) {
        // Calculate total wallet balance from assets
        const totalWalletBalance = walletAssets.reduce((acc, asset) => acc + parseFloat(asset.totalCurrentFiatValue), 0)
        setTotalBalance(toNearestDecimal(totalWalletBalance, countrySetting?.iso, 2))

        const assetMapForState: Map<string, IAssetMapData> = new Map()

        for (const asset of walletAssets) {
          if (assetMapForState.has(asset.cryptocurrency.publicId)) {
            const assetMapData = assetMapForState.get(asset.cryptocurrency.publicId)
            assetMapForState.set(asset.cryptocurrency.publicId, {
              ...assetMapData,
              individualChainAssetData: [
                ...assetMapData.individualChainAssetData,
                {
                  blockChainId: asset.blockchainId,
                  totalUnits: asset.totalUnits,
                  totalCostBasis: asset.totalCostBasis,
                  totalCurrentFiatValue: asset.totalCurrentFiatValue
                }
              ]
            })
          } else {
            assetMapForState.set(asset.cryptocurrency.publicId, {
              name: `${asset.cryptocurrency.name} (${asset.cryptocurrency.symbol})`,
              symbol: asset.cryptocurrency.symbol,
              imageUrl: asset.cryptocurrency.image.small,
              currentFiatPrice: asset.currentFiatPrice,
              fiatCurrency: asset.fiatCurrency,
              cryptocurrency: asset.cryptocurrency,
              individualChainAssetData: [
                {
                  blockChainId: asset.blockchainId,
                  totalUnits: asset.totalUnits,
                  totalCostBasis: asset.totalCostBasis,
                  totalCurrentFiatValue: asset.totalCurrentFiatValue
                }
              ]
            })
          }
        }

        setAssetMap(assetMapForState)
        const zeroValueAssets = [...assetMapForState.keys()].filter((assetKey) => {
          const asset = assetMapForState.get(assetKey)
          const totalCurrentFiatValue = asset.individualChainAssetData.reduce(
            (acc, cur) => acc + parseFloat(cur.totalCurrentFiatValue),
            0
          )
          return totalCurrentFiatValue === 0
        })

        // Abstract to a function
        if (zeroValueAssets.length > 0) {
          const visibleAssetMapKeysForState = [...assetMapForState.keys()].filter((assetKey) => {
            const asset = assetMapForState.get(assetKey)
            const totalCurrentFiatValue = asset.individualChainAssetData.reduce(
              (acc, cur) => acc + parseFloat(cur.totalCurrentFiatValue),
              0
            )
            return totalCurrentFiatValue !== 0
          })
          setVisibleAssetsMapKey(visibleAssetMapKeysForState)
          setIsAssetsEmpty(false)
          setHasZeroValueAssets(true)
          setAreZeroValueAssetsHidden(true)
        } else {
          setVisibleAssetsMapKey([...assetMapForState.keys()])
          setHasZeroValueAssets(false)
          setIsAssetsEmpty(false)
        }
      } else {
        setIsAssetsEmpty(true)
      }
    }
  }, [isGetWalletAssetsSuccess, isGetAssetsFetching, walletAssets, searchTermForAssets])

  useEffect(() => {
    if (!isGetWalletDetailsFetching && isGetWalletDetailsSuccess) {
      // Cleanup later - wallet chains
      const walletsChains = Object.keys(walletDetails.balance.blockchains)
      const walletsSupportedChainsData = supportedChains?.filter((chain) => walletsChains.includes(chain.id))
      setWalletChains(walletsSupportedChainsData) // Change this into a hook at least locally as this transformation is needed for asset data grid also

      // Created at date transformation
      if (walletDetails?.createdAt && timeZonesetting?.utcOffset) {
        const parsedDateFromTimeStamp = parseISO(walletDetails.createdAt.slice(0, -1))
        const finalConvertedDate = addMinutes(parsedDateFromTimeStamp, timeZonesetting?.utcOffset || 480)
        setCreatedAt(format(finalConvertedDate, 'MMM dd, yyyy'))
      }
    }
  }, [isGetWalletDetailsSuccess, isGetWalletDetailsFetching])

  const safeService = useMemo(() => {
    let service: SafeServiceClient
    try {
      // There will be only one chain for a safe as it will be selected
      // when the safe is created
      const chain = walletChains[0]
      const serviceUrl = (chain && safeServiceUrl[chain.id]) || 'https://safe-transaction.gnosis.io'
      const signer = new ethers.providers.JsonRpcProvider(netWorkRpc[chain.id]).getSigner()
      const ethAdapter = new EthersAdapter({
        ethers,
        signer
      })
      service = new SafeServiceClient({
        txServiceUrl: serviceUrl,
        ethAdapter
      })
    } catch (error: any) {
      log.error(
        error?.message ?? 'Error while fetching safe info on Add Safe form',
        ['Error while fetching safe info on Add Safe form'],
        {
          actualErrorObject: error
        },
        `${window.location.pathname}`
      )
    }
    return service
  }, [walletChains])

  // get safe info
  const getSafeOwners = async () => {
    if (isGetWalletDetailsSuccess && walletDetails.address && safeService) {
      try {
        const result = await safeService.getSafeInfo(toChecksumAddress(walletDetails?.address))
        setSafeOwners(result.owners) ///
      } catch (error: any) {
        setSafeError('Could not fetch safe details. You may try again later.')
        log.error(
          // @ts-ignore TS2339
          error?.message ?? 'Error while fetching safe info',
          ['Error while fetching safe info'],
          {
            actualErrorObject: error
          },
          `${window.location.pathname}`
        )
      }
    }
  }

  useEffect(() => {
    if (isGetWalletDetailsSuccess && safeService && walletDetails.sourceType === SourceType.GNOSIS) {
      getSafeOwners()
    }
  }, [isGetWalletDetailsSuccess, safeService])

  useEffect(() => {
    if (!isFetching && isGetContactsSuccess) {
      const contactsMap = new Map()
      for (const contact of contacts) {
        if (contact?.addresses.length > 0) {
          contact.addresses.map((addressObj) => contactsMap.set(toChecksumAddress(addressObj.address), contact.name))
        }
      }
      setOrganizationContacts(contactsMap)
    }
  }, [isFetching, isGetContactsSuccess])

  const breadcrumbItems = [{ to: `/${organizationId}/wallets`, label: 'Wallets' }]

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermForAssets(e.target.value)
  }

  // Possible optimization for later: Add all assets and toggle their css based on button selection
  const handleToggleZeroValueAssets = () => {
    if (areZeroValueAssetsHidden) {
      setVisibleAssetsMapKey([...assetMap.keys()])
      setAreZeroValueAssetsHidden(false)
    } else {
      setVisibleAssetsMapKey(
        [...assetMap.keys()].filter((assetKey) => {
          const asset = assetMap.get(assetKey)
          const totalCurrentFiatValue = asset.individualChainAssetData.reduce(
            (acc, cur) => acc + parseFloat(cur.totalCurrentFiatValue),
            0
          )
          return totalCurrentFiatValue !== 0
        })
      )
      setAreZeroValueAssetsHidden(true)
    }
  }

  const getWalletMetaData = () => (
    <div className="flex gap-48">
      <div>
        <Typography variant="overline" color="secondary">
          Address
        </Typography>
        <div className="flex">
          <Typography variant="caption">{toShort(walletDetails.address, 5, 4)}</Typography>
          <WalletAddressActionButtons address={walletDetails.address} />
        </div>
      </div>
      <div>
        <Typography variant="overline" color="secondary">
          Chain
        </Typography>
        <ChainList chains={walletChains} />
      </div>
      <div>
        <Typography variant="overline" color="secondary">
          Type
        </Typography>
        <Typography variant="caption">
          {walletDetails.sourceType === SourceType.GNOSIS ? 'Safe' : 'EOA Wallet'}
        </Typography>
      </div>
      <div>
        <Typography variant="overline" color="secondary">
          Wallet Group
        </Typography>
        <Typography variant="caption">{walletDetails?.group?.name}</Typography>
      </div>
      {createdAt && (
        <div>
          <Typography variant="overline" color="secondary">
            Added On
          </Typography>
          <Typography variant="caption">{createdAt}</Typography>
        </div>
      )}
    </div>
  )

  const getWalletBalance = () => (
    <div className="p-4 rounded-xl border border-grey-200 mt-4">
      <Typography variant="overline" color="secondary">
        Total Balance
      </Typography>
      <Typography variant="heading2" color="primary">
        {`${fiatCurrencySetting?.symbol}${totalBalance} ${fiatCurrencySetting?.code}`}
      </Typography>
    </div>
  )

  const getCollapsibleAssets = () => (
    <>
      <div className="flex mt-9 justify-between">
        <Typography variant="heading3">Assets</Typography>
        {(!isAssetsEmpty || (isAssetsEmpty && searchTermForAssets !== '')) && (
          <div>
            <Input
              placeholder="Search by asset name, symbol"
              id="wallet-search"
              onChange={handleChangeText}
              value={searchTermForAssets}
              isSearch
              classNames="h-[34px] text-sm min-w-[277px]"
            />
          </div>
        )}
      </div>
      {/* TODO: ABSTRACT THE BELOW INTO A COMPONENT */}
      <div className="mt-5 flex flex-col">
        {!isAssetsEmpty &&
          visibleAssetMapKeys?.length > 0 &&
          visibleAssetMapKeys.map((assetKey) => {
            const individualAssetData = assetMap.get(assetKey)
            const assetChains = individualAssetData.individualChainAssetData.map((asset) => asset.blockChainId)
            const supportedChainsData = supportedChains?.filter((chain) => assetChains.includes(chain.id))

            return (
              <AssetItem
                key={`${individualAssetData.name}`}
                asset={individualAssetData}
                supportedChains={supportedChainsData}
              />
            )
          })}
        {isAssetsEmpty && (
          <div className="border p-3 rounded-lg border-grey-200">
            <Typography variant="body2" styleVariant="semibold">
              {searchTermForAssets
                ? `No results found for "${searchTermForAssets}"`
                : 'There are no assets in this wallet.'}
            </Typography>
          </div>
        )}
        {hasZeroValueAssets && !isAssetsEmpty && (
          <div className="flex items-center text-center mx-auto gap-2 mt-2 pr-6 justify-self-center">
            <div className="text-xs font-medium">
              {areZeroValueAssetsHidden ? 'Show tokens with zero balance' : 'Hide tokens with zero balance'}
            </div>
            <Button
              variant="grey"
              classNames="text-[0.75rem]"
              onClick={handleToggleZeroValueAssets}
              height={24}
              label={areZeroValueAssetsHidden ? 'View All' : 'Hide All '}
            />
          </div>
        )}
      </div>
    </>
  )

  const getAssetComponent = () => (
    <>
      <div className="flex mt-9 justify-between">
        <Typography variant="heading3">Assets</Typography>
        {(!isAssetsEmpty || (isAssetsEmpty && searchTermForAssets !== '')) && (
          <div>
            <Input
              placeholder="Search by asset name, symbol"
              id="wallet-search"
              onChange={handleChangeText}
              value={searchTermForAssets}
              isSearch
              classNames="h-[34px] text-sm min-w-[277px]"
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col">
        {!isAssetsEmpty &&
          visibleAssetMapKeys?.length > 0 &&
          visibleAssetMapKeys.map((assetKey) => {
            const assetData = assetMap.get(assetKey)
            const assetChains = assetData.individualChainAssetData.map((asset) => asset.blockChainId)
            const supportedChainsData = supportedChains?.filter((chain) => assetChains.includes(chain.id))

            return <AssetItem key={`${assetData.name}`} asset={assetData} supportedChains={supportedChainsData} />
          })}
        {isAssetsEmpty && (
          <div className="border p-3 rounded-lg border-grey-200">
            <Typography variant="body2" styleVariant="semibold">
              {searchTermForAssets
                ? `No results found for "${searchTermForAssets}"`
                : 'There are no assets in this wallet.'}
            </Typography>
          </div>
        )}
        {hasZeroValueAssets && !isAssetsEmpty && (
          <div className="flex items-center text-center mx-auto gap-2 mt-2 pr-6 justify-self-center">
            <div className="text-xs font-medium">
              {areZeroValueAssetsHidden ? 'Show tokens with zero balance' : 'Hide tokens with zero balance'}
            </div>
            <Button
              variant="grey"
              classNames="text-[0.75rem]"
              onClick={handleToggleZeroValueAssets}
              height={24}
              label={areZeroValueAssetsHidden ? 'View All' : 'Hide All '}
            />
          </div>
        )}
      </div>
    </>
  )

  if (isLoading || !walletDetails) {
    return <Loading dark title="Fetching Data" />
  }
  return (
    <>
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.back()}
          />
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
            <Link href={`${window.location.pathname}`} legacyBehavior>
              <div className="flex items-center gap-4">
                {walletDetails.flaggedAt && <Image src={redFlag} width={20} height={20} />}
                <span>{walletDetails?.name}</span>
              </div>
            </Link>
          </Breadcrumb>
        </div>
        <Header.Right>
          <Button
            variant="ghostRed"
            label="Delete"
            height={32}
            onClick={() => setShowDeleteWalletConfirmationModal(true)}
          />
          <Button variant="black" label="Edit" height={32} width="w-28" onClick={() => setShowEditWalletModal(true)} />
        </Header.Right>
      </Header>
      <View.Content>
        {walletDetails.sourceType === SourceType.GNOSIS && (
          <UnderlineTabs
            tabs={SETTING_TABS}
            active={activeTab}
            setActive={setActiveTab}
            classNameBtn="font-semibold text-sm px-6 py-[10px]"
            wrapperClassName=" border-b-[1px] border-grey-200"
          >
            <TabItem key={SETTING_TABS[0].key}>
              <div className="mt-4">
                {getWalletMetaData()}
                {getWalletBalance()}
                {getCollapsibleAssets()}
              </div>
            </TabItem>
            <TabItem key={SETTING_TABS[1].key}>
              <div className="mt-4">
                {safeError && (
                  <Alert variant="danger" className="mt-5 leading-6 font-medium py-3" fontSize="text-base">
                    {safeError}
                  </Alert>
                )}
                {safeOwners &&
                  !safeError &&
                  safeOwners.map((owner, index) => {
                    const addressExistsInContacts = !!organizationContacts.get(owner)
                    return (
                      <div key={owner} className="bg-gray-50 rounded-lg p-4 mb-3 grid grid-cols-3 items-center">
                        <Typography variant="body2">
                          {addressExistsInContacts
                            ? `${index + 1}. ${organizationContacts.get(owner)}`
                            : `${index + 1}. Unknown Address`}
                        </Typography>
                        <div className="flex">
                          <Typography variant="body2">{owner}</Typography>
                          <WalletAddressActionButtons address={owner} />
                        </div>
                        {!addressExistsInContacts && (
                          <div className="w-[fit-content] justify-self-end">
                            <AddToContactsButton addressToAdd={owner} />
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </TabItem>
          </UnderlineTabs>
        )}
        {walletDetails.sourceType !== SourceType.GNOSIS && (
          <>
            {getWalletMetaData()}
            {getWalletBalance()}
            {getCollapsibleAssets()}
          </>
        )}
        {showDeleteWalletConfirmationModal && (
          <DeleteSourceModal
            walletSource={walletDetails}
            onModalClose={() => setShowDeleteWalletConfirmationModal(false)}
            showModal={showDeleteWalletConfirmationModal}
            setShowModal={setShowDeleteWalletConfirmationModal}
            option
            onClose={() => setShowDeleteWalletConfirmationModal(false)}
            title="Delete Wallet?"
            description="All transactions and assets on this wallet will also be deleted. You can import this wallet again later."
            acceptText="Delete Wallet"
            declineText="Back"
            memberData={memberData}
          />
        )}
        {showEditWalletModal && (
          <EditModal
            source={walletDetails}
            option
            onEditModalClose={() => setShowEditWalletModal(false)}
            showEditModal={showEditWalletModal}
            setShowEditModal={setShowEditWalletModal}
            onClose={() => setShowEditWalletModal(false)}
            title="Edit Wallet Detail"
            description="This edits your wallet name"
            setDisable={() => console.log('')}
            isLoading={isLoading}
            acceptText="Save Change"
            declineText="Back"
            memberData={memberData}
          />
        )}
      </View.Content>
    </>
  )
}

export default WalletDetail
