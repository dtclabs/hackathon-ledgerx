import Typography from '@/components-v2/atoms/Typography'
import { IContacts } from '@/slice/contacts/contacts.types'
import Image from 'next/legacy/image'

const ContactWalletsDetail = ({
  contactWallets,
  supportedChains
}: {
  contactWallets: IContacts['recipientAddresses']
  supportedChains: any
}) => (
  <div className="rounded-lg border border-grey-200">
    <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Wallet Addresses
      </Typography>
    </div>
    <div className="flex flex-col gap-6 p-4">
      {contactWallets?.length > 0 ? (
        contactWallets.map((wallet) => {
          const blockchain = supportedChains?.find((_chain) => _chain.id === wallet.blockchainId)
          return (
            <div key={wallet.id} className="flex items-center">
              <div className="w-[250px] flex items-center gap-2">
                {blockchain && <Image src={blockchain.imageUrl} height={16} width={16} />}
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[226px]">
                  {blockchain ? blockchain.name.split(' ')[0] : 'Ethereum'} Wallet
                </Typography>
              </div>
              <Typography color="dark">{wallet.address}</Typography>
            </div>
          )
        })
      ) : (
        <div className="flex flex-col items-start justify-center">
          <Typography>No wallet addresses</Typography>
        </div>
      )}
    </div>
  </div>
)

export default ContactWalletsDetail
