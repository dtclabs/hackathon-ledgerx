import FreeToSend from '@/views/SendPayment/SendPayment'
import { FreeProvider } from '@/contexts/FreeContext'
import { useEffect } from 'react'
import { BlankView } from '@/components-v2/templates'
import { connectorLocalStorageKey, ConnectorNames } from '@/utils/web3React'
import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { NextPageWithLayout } from '../_app'
import fetch from 'isomorphic-fetch'
import { isAddress } from 'ethers/lib/utils'
import InvalidLink from '@/views/InvalidLink/InvalidLink'
import { TOKEN_IMG } from '@/views/ReceivePayment/ReceivePayment'

// eslint-disable-next-line consistent-return
export async function getServerSideProps({ query, req, res }) {
  const orgId = query.organizationId
  const walletAddress = query.address

  if (orgId) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress })
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgId}/public`, requestOptions)
    const organizationDetails = await response.json()

    if (response.status === 404 || response.status === 400) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        organization: organizationDetails
      }
    }
  }
}

interface IProps {
  organization?: any
}

const IndexPage: NextPageWithLayout<IProps> = ({ organization }) => {
  // const { login } = useAuth()
  const { query } = useRouter()

  // useEffect(() => {
  //   const connectorId = window.localStorage.getItem(connectorLocalStorageKey) as ConnectorNames
  //   if (connectorId) {
  //     login(connectorId)
  //   }
  // }, [login])

  const isTokenValid = TOKEN_IMG.find((token) => token.symbol === query?.token)
  const isAddressValid = ethers.utils.isAddress(String(query?.address))

  const isGenericLink = () => {
    if (!query.amount && !query.remarks && query.address && query.id && query.token) {
      return true
    }
    return false
  }

  const isLinkInvalid = () => {
    if (!query.id) {
      return true
    }
    if (!query.address || !isAddress(query.address as string) || !isTokenValid) {
      return true
    }

    if (query.amount && !(parseFloat(query.amount as string) > 0)) {
      return true
    }

    if (query.amount && query.address && isTokenValid && !query.remarks) {
      return true
    }

    return false
  }
  return (
    <FreeProvider
      platformName={organization.name}
      platformLogoUrl={query.platformLogoUrl as string}
      recipients={[
        {
          address: [query.address as string],
          amount: [query.amount as string] || ['0'],
          token: [query.token as string],
          remark: [(query.remarks || '') as string] || ['']
        }
      ]}
    >
      {isLinkInvalid() ? (
        <InvalidLink
          paymentId={!query.id}
          amountMissing={!query.amount || !(parseFloat(query.amount as string) > 0)}
          invoiceMissing={!query.remarks}
          tokenInvalid={isTokenValid === undefined}
          addressInvalid={!isAddressValid}
        />
      ) : (
        <FreeToSend organization={organization} isGenericLink={isGenericLink()} />
      )}
    </FreeProvider>
  )
}

export default IndexPage

IndexPage.Layout = function getLayout(page) {
  return <BlankView>{page}</BlankView>
}

// {!query.address ||
//   !isAddress(query.address as string) ||
//   (query.amount && !(parseFloat(query.amount as string) > 0)) ||
//   !isTokenValid ||
//   (query.remarks && query.remarks === '') ? (
//     <InvalidLink
//       amountMissing={!query.amount || !(parseFloat(query.amount as string) > 0)}
//       invoiceMissing={!query.remarks}
//       tokenInvalid={isTokenValid === undefined}
//       addressInvalid={!isAddressValid}
//     />
//   ) : (
//     <FreeToSend organization={organization} isGenericLink={isGenericLink()} />
//   )}
