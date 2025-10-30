import Typography from '@/components-v2/atoms/Typography'
import Loading from '@/components/Loading'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { IContactBankAccount } from '@/slice/contact-bank-accounts/contact-bank-accounts-types'
import { EContactType } from '@/slice/contacts/contacts.types'

const BankAccountsDetail = ({
  bankAccounts,
  isLoading,
  countries,
  type
}: {
  bankAccounts: IContactBankAccount[]
  isLoading: boolean
  countries: any[]
  type: EContactType
}) => (
  <div className="rounded-lg border border-grey-200">
    <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center justify-between">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Bank Accounts
      </Typography>
    </div>
    <div className="flex flex-col gap-6 p-4">
      {isLoading ? (
        <Loading dark title="Fetching Bank Accounts" height="h-full" />
      ) : bankAccounts?.length > 0 ? (
        bankAccounts.map((bankAccount) => (
          <div key={bankAccount?.id} className="flex items-start gap-4 border-b pb-6 last:border-none last:pb-0">
            <SVGIcon name="AssetIcon" width={16} height={16} stroke="#2D2D2C" />
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center">
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                  {type === EContactType.organization ? 'Registered Name' : 'Full Name'} (as registered with the bank)
                </Typography>
                <Typography color="dark" classNames="basis-1/2">
                  {bankAccount?.destinationAccount?.accountName}
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                  Country of Bank
                </Typography>
                <Typography color="dark" classNames="basis-1/2">
                  {countries?.find(
                    (_country) =>
                      _country?.iso3.toLowerCase() === bankAccount?.destinationAccount?.countryCode?.toLowerCase()
                  )?.name || bankAccount?.destinationAccount?.countryCode}
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                  Bank Name
                </Typography>
                <Typography color="dark" classNames="basis-1/2">
                  {bankAccount?.bankName}
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                  Bank Account Number
                </Typography>
                <Typography color="dark" classNames="basis-1/2">
                  {bankAccount?.destinationAccount?.accountNumber}
                </Typography>
              </div>
              <div className="flex items-center">
                <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                  Currency
                </Typography>
                <Typography color="dark" classNames="basis-1/2">
                  {bankAccount?.fiatCurrency?.code}
                </Typography>
              </div>
              {bankAccount?.destinationAccount?.routingCode && (
                <div className="flex items-center">
                  <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                    Routing Code
                  </Typography>
                  <Typography color="dark" classNames="basis-1/2">
                    {bankAccount?.destinationAccount?.routingCode}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-start justify-center">
          <Typography>No bank accounts</Typography>
        </div>
      )}
    </div>
  </div>
)

export default BankAccountsDetail
