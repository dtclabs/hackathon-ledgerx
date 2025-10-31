import { IntegrationName } from '@/api-v2/organization-integrations'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { Alert } from '@/components-v2/molecules/Alert'
import Loading from '@/components/Loading'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { IBankAccountField } from '@/hooks-v2/contact/type'
import EditIcon from '@/public/svg/Edit.svg'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import { integrationSelector } from '@/slice/org-integration/org-integration-selector'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

interface IBankAccount {
  isBankAccountsLoading?: boolean
  countryOptions: { value: string; label: string }[]
  bankAccountFields?: IBankAccountField[]
  onRemoveBankAccount: (index: number) => void
  onAppendBankAccount: () => void
  onEditBankAccount: (index: number) => void
}

const BankAccounts: React.FC<IBankAccount> = ({
  isBankAccountsLoading,
  bankAccountFields,
  countryOptions,
  onAppendBankAccount,
  onRemoveBankAccount,
  onEditBankAccount
}) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const subscription = useAppSelector(subscriptionPlanSelector)
  const integrations = useAppSelector(integrationSelector)

  const isEnable = useMemo(
    () =>
      subscription?.organizationIntegrationAddOns?.triple_a &&
      integrations?.some((integration) => integration?.integrationName === IntegrationName.TRIPLE_A),
    [subscription]
  )

  return (
    <div className="rounded-lg border border-grey-200">
      <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center justify-between">
        <Typography variant="body1" color="dark" styleVariant="semibold">
          Bank Accounts
        </Typography>
        {isEnable && <Button height={32} variant="grey" label="+ Add a Bank Account" onClick={onAppendBankAccount} />}
      </div>
      {isEnable ? (
        <div className="flex flex-col gap-6 p-4">
          {isBankAccountsLoading ? (
            <Loading dark title="Fetching Bank Accounts" height="h-full" />
          ) : bankAccountFields?.length > 0 ? (
            bankAccountFields.map((bankAccount, index) => (
              <div key={bankAccount.id} className="flex items-start gap-4">
                <div className="flex gap-4 p-4 w-full border border-grey-200 rounded-lg">
                  <SVGIcon name="AssetIcon" width={16} height={16} stroke="#2D2D2C" />
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center">
                      <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                        Full Name (as registered with the bank)
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
                        {countryOptions?.find(
                          (_country) =>
                            _country?.value.toLowerCase() ===
                            bankAccount?.destinationAccount?.countryCode?.toLowerCase()
                        )?.label || bankAccount?.destinationAccount?.countryCode}
                      </Typography>
                    </div>
                    <div className="flex items-center">
                      <Typography variant="body2" color="dark" styleVariant="semibold" classNames="basis-1/2">
                        Bank Name
                      </Typography>
                      <Typography color="dark" classNames="basis-1/2">
                        {bankAccount?.destinationAccount?.bankName}
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
                        {bankAccount?.destinationAccount?.currency}
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
                <div className="flex flex-col gap-4">
                  <Button
                    height={48}
                    variant="ghost"
                    leadingIcon={<Image src={EditIcon} alt="delete" height={16} width={16} />}
                    onClick={() => onEditBankAccount(index)}
                  />
                  <Button
                    height={48}
                    variant="ghost"
                    leadingIcon={<Image src={DeleteIcon} alt="delete" height={16} width={16} />}
                    onClick={() => onRemoveBankAccount(index)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center">
              <Typography>Add a bank account to send Fiat payments to this contact.</Typography>
              <Button
                height={32}
                variant="grey"
                label="Add a Bank Account"
                classNames="w-fit"
                onClick={onAppendBankAccount}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center p-4">
          <Alert isVisible variant="warning" fullWidth>
            <Alert.Icon />
            <Alert.Text>Unlock Crypto to Fiat payments via the Integrations tab to add bank accounts.</Alert.Text>
            <Alert.CloseButton
              label="Get Started"
              onClickClose={() => router.push(`/${organizationId}/orgsettings?activeTab=pricingAndPlans`)}
            />
          </Alert>
        </div>
      )}
    </div>
  )
}

export default BankAccounts
