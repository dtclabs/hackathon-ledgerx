import Typography from '@/components-v2/atoms/Typography'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import Link from 'next/link'
import PaymentIconSquare from '../components/PaymentIconSquare'
import { CurrencyType } from '@/api-v2/payment-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/state'
import { resetTransferSlice } from '@/slice/transfer/transfer.slice'
import { selectReviewData } from '@/slice/transfer/transfer.selectors'
import usePaymentHandler from '../hooks/usePaymentHandler'

const SelectPaymentType = () => {
  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const reviewData = useAppSelector(selectReviewData)

  const { deletePayments } = usePaymentHandler()

  useEffect(() => {
    // reset data when back to select type page
    deletePayments({ recipients: reviewData.recipients })
    dispatch(resetTransferSlice())
  }, [])

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Make Payment</Header.Left.Title>
        </Header.Left>
      </Header>
      <View.Content>
        <div className="flex justify-center">
          <div className="mt-[120px] flex-col justify-center content-center text-center">
            <Typography variant="heading3" classNames="mb-6" styleVariant="semibold">
              Select the type of payment you want to make
            </Typography>
            <div className="flex">
              <Link href={`/${organizationId}/transfer/crypto`} className="mr-4">
                <PaymentIconSquare
                  paymentName="Crypto to Crypto"
                  description="Effortlessly transact in cryptocurrencies with our Crypto to Crypto payment."
                  paymentType={CurrencyType.CRYPTO}
                />
              </Link>
              <Link href={`/${organizationId}/transfer/fiat`}>
                <PaymentIconSquare
                  paymentName="Crypto to Fiat"
                  description="Seamlessly transact between cryptocurrencies and fiat with our Crypto to Fiat payment."
                  paymentType={CurrencyType.FIAT}
                />
              </Link>
            </div>
          </div>
        </div>
      </View.Content>
    </>
  )
}
export default SelectPaymentType
