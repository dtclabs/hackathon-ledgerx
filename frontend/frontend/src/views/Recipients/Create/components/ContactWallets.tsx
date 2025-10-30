import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import TextField from '@/components/TextField/TextField'
import HelperText from '@/components/ValidationRequired/HelperText'
import { IWalletField } from '@/hooks-v2/contact/type'
import useSelectedNativeChainToken from '@/hooks-v2/cryptocurrency/useSelectNativeChainToken'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'
import Image from 'next/legacy/image'
import React from 'react'

interface IContactWallet {
  control: any
  errors: any
  apiError: string
  walletFields: IWalletField[]
  onRemoveWallet: (index: number) => void
  onAppendWallet: () => void
  onUpdateWallet: (index: number, value) => void
}

const ContactWallets: React.FC<IContactWallet> = ({
  control,
  errors,
  apiError,
  walletFields,
  onAppendWallet,
  onRemoveWallet,
  onUpdateWallet
}) => {
  const { findNativeCoins } = useSelectedNativeChainToken()
  const supportedChains = useAppSelector(supportedChainsSelector)

  return (
    <div className="rounded-lg border border-grey-200">
      <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center justify-between">
        <Typography variant="body1" color="dark" styleVariant="semibold">
          Wallet Addresses
        </Typography>
        <Button height={32} variant="grey" label="+ Add a Wallet Address" onClick={onAppendWallet} />
      </div>
      <div className="p-4">
        {walletFields?.length > 0 ? (
          <div className="flex flex-col gap-6">
            {walletFields.map((wallet, index) => {
              const blockchain = supportedChains?.find((_chain) => _chain.id === wallet.blockchainId)
              return (
                <div key={wallet.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center w-full focus-within:shadow-inputField border border-grey-200 p-1 gap-4">
                      <NewFilterDropDown
                        triggerButton={
                          <div className="w-[152px] bg-grey-100 border border-grey-200 rounded text-left px-3 py-[10px] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {blockchain && <Image src={blockchain.imageUrl} height={16} width={16} />}
                              <Typography>{blockchain ? blockchain.name.split(' ')[0] : 'Ethereum'}</Typography>
                            </div>
                            <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                          </div>
                        }
                      >
                        {(supportedChains || []).map((item) => (
                          <Button
                            key={item.id}
                            variant="whiteWithBlackBorder"
                            height={40}
                            onClick={() => {
                              const nativeCoin = findNativeCoins(item.id)
                              onUpdateWallet(index, {
                                ...wallet,
                                blockchainId: item.id,
                                cryptocurrencySymbol: nativeCoin?.symbol || 'ETH'
                              })
                            }}
                            label={item.name.split(' ')[0]}
                            leadingIcon={<Image src={item.imageUrl} height={16} width={16} />}
                            classNames={`!border-0 w-full !justify-start !font-normal ${
                              item.id === '4' && 'bg-gray-50'
                            }`}
                          />
                        ))}
                      </NewFilterDropDown>
                      <TextField
                        control={control}
                        errors={errors}
                        classNameInput="focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-[38px] pr-4"
                        errorClass="mt-1"
                        name={`wallets.${index}.walletAddress`}
                        placeholder="Enter wallet address"
                      />
                    </div>
                    <Button
                      height={48}
                      variant="ghost"
                      leadingIcon={<Image src={DeleteIcon} alt="delete" height={16} width={16} />}
                      onClick={() => onRemoveWallet(index)}
                    />
                  </div>
                  {((errors && errors?.wallets && errors?.wallets?.[index]?.walletAddress) || apiError) && (
                    <HelperText helperText={apiError || errors.wallets[index].walletAddress.message} />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center">
            <Typography>Add a wallet address to send Crypto payments to this contact.</Typography>
            <Button
              height={32}
              variant="grey"
              label="Add a Wallet Address"
              classNames="w-fit"
              onClick={onAppendWallet}
            />
          </div>
        )}
        {errors?.wallets?.message && <HelperText helperText={errors?.wallets?.message} />}
      </div>
    </div>
  )
}

export default ContactWallets
