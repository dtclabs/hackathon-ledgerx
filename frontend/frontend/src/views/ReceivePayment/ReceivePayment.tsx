import { useGetPaymentLinksQuery } from '@/api-v2/payment-link-api'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import React, { useEffect, useMemo, useState } from 'react'
import LinkLists from './components/LinkLists/LinkLists'
import ReceivePaymentForm from './components/ReceivePaymentForm'
import XeroInfoCard from './components/XeroInfoCard'
import EthImg from '@/public/svg/ETH.svg'
import MaticImg from '@/public/svg/MATIC.svg'
import DaiImg from '@/public/svg/DAI.svg'
import USDTImg from '@/public/svg/USDT.svg'
import USDCImg from '@/public/svg/USDC.svg'
import XSGDImg from '@/public/svg/XSGD.svg'
import XIDRImg from '@/public/svg/XIDR.svg'
import BLUSGD from '@/public/svg/tokens/blu-sgd.png'
import { useToken } from '@/hooks/useToken'
import { selectedChainSelector, setChain } from '@/slice/platform/platform-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import Typography from '@/components-v2/atoms/Typography'

export const TOKEN_IMG = [
  {
    symbol: 'ETH',
    img: EthImg
  },
  {
    symbol: 'USDC',
    img: USDCImg
  },
  {
    symbol: 'XSGD',
    img: XSGDImg
  },
  {
    symbol: 'XIDR',
    img: XIDRImg
  },
  {
    symbol: 'USDT',
    img: USDTImg
  },
  {
    symbol: 'DAI',
    img: DaiImg
  },
  {
    symbol: 'MATIC',
    img: MaticImg
  },
  {
    symbol: 'BLUSGD',
    img: BLUSGD
  }
]
export interface ILink {
  token: any
  address: string
  link: string
  id: string
}

const ReceivePayment = () => {
  const host = window.location.origin
  const selectedChain = useAppSelector(selectedChainSelector)
  const dispatch = useAppDispatch()

  const organizationId = useOrganizationId()
  const { data } = useGetPaymentLinksQuery(organizationId)
  const { supportedChain } = useToken()
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencies)

  const paymentLinks: ILink[] = useMemo(
    () =>
      data?.data?.map((link) => {
        const token = verifiedTokens?.find((item) => item.symbol === link?.cryptocurrency)
        const paymentLink = `${host}/${link.organizationId}?id=${link.publicId}&address=${link.address}&token=${link?.cryptocurrency}&amount=[AMOUNTDUE]&remarks=[INVOICENUMBER]`
        return {
          address: link.address,
          token,
          link: paymentLink,
          id: link.publicId
        }
      }),
    [data?.data, selectedChain?.id, verifiedTokens]
  )

  useEffect(() => {
    dispatch(setChain('1')) // Hardcoded to fetch balances for ethereum chain
  }, [])

  const [formShow, setFormShow] = useState<boolean>(true)

  useEffect(() => {
    if (data && data.data?.length > 0) {
      setFormShow(false)
    } else {
      setFormShow(true)
    }
  }, [data])

  return (
    <div className="bg-white p-6 rounded-lg">
      <Typography variant="heading3">Payment Links</Typography>
      <div className="mt-2">
        <Typography color="secondary">Coming soon</Typography>
        <Typography variant="body2" classNames="mt-1">
          We&apos;re preparing the Drafts experience. Please check back later.
        </Typography>
      </div>
    </div>
  )

  // return (
  //   <>
  //     <Header>
  //       <Header.Left>
  //         <Header.Left.Title>Receive Payment</Header.Left.Title>
  //       </Header.Left>
  //     </Header>
  //     <View.Content>
  //       <div className="flex border rounded-lg w-[calc(100%-48px)]">
  //         <XeroInfoCard />
  //         {formShow ? (
  //           <ReceivePaymentForm
  //             paymentLinks={paymentLinks}
  //             setFormShow={setFormShow}
  //             tokens={verifiedTokens}
  //             chains={supportedChain}
  //           />
  //         ) : (
  //           <LinkLists linkList={paymentLinks} setFormShow={setFormShow} />
  //         )}
  //       </div>
  //     </View.Content>
  //   </>
  // )
}

export default ReceivePayment
