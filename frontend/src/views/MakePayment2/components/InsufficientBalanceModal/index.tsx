import { FC, useState } from 'react'
import { ethers } from 'ethers'
import { useAppSelector } from '@/state'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { selectCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { selectChartOfAccountMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import * as yup from 'yup'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'
import { capitalize } from 'lodash'
import warningIcon from '@/public/svg/icons/round-warning.svg'

interface IProps {
  provider: any
  tokensWithInsufficientBalance: any
  setPreReviewStepsLoading: (flag: boolean) => void
}

const InsufficientBalanceModal: FC<IProps> = ({
  provider,
  tokensWithInsufficientBalance,
  setPreReviewStepsLoading
}) => (
  <BaseModal provider={provider}>
    <BaseModal.Header>
      <BaseModal.Header.HeaderIcon icon={warningIcon} />
      <BaseModal.Header.Title>Insufficient Balance</BaseModal.Header.Title>
    </BaseModal.Header>
    <BaseModal.Body>
      <Typography variant="body2" classNames="max-w-[400px] mb-2">
        Please make sure that your wallet holds enough balance to cover the transaction amount and gas fees. The
        following tokens do not have enough balance in your wallet.
      </Typography>
      <div>
        {Object.keys(tokensWithInsufficientBalance).map((token) => (
          <div key={token} className="flex gap-2">
            <Typography variant="body2">{token}</Typography>
            <Typography variant="body2">{`Balance: ${tokensWithInsufficientBalance[token].availableBalanceInWallet}`}</Typography>
            <Typography variant="body2">{`Amount: ${tokensWithInsufficientBalance[token].amount}`}</Typography>
          </div>
        ))}
      </div>
    </BaseModal.Body>
    <BaseModal.Footer>
      <BaseModal.Footer.SecondaryCTA
        label="Cancel"
        onClick={() => {
          setPreReviewStepsLoading(false)
          provider.methods.setIsOpen(false)
        }}
      />
      <BaseModal.Footer.PrimaryCTA
        label="Select Another Wallet"
        onClick={() => {
          setPreReviewStepsLoading(false)
          provider.methods.setIsOpen(false)
        }}
      />
    </BaseModal.Footer>
  </BaseModal>
)
export default InsufficientBalanceModal
