/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-page-custom-font */
import React, { Fragment, ReactElement, ReactNode, useEffect, useRef } from 'react'
import '@/styles/globals.css'
import { ErrorBoundary, setUser } from '@sentry/nextjs'
import { ToastContainer } from 'react-toastify'
import { NextPage } from 'next'
import Cookies from 'js-cookie'
import Image from 'next/legacy/image'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import store, { useAppSelector } from '@/state'
import Providers from '@/Providers'

import useWeb3Listener from '@/hooks-v2/web3Hooks/useWeb3Listener'
import 'react-datepicker/dist/react-datepicker.css'
import 'react-toastify/dist/ReactToastify.css'
import { CHAINID } from '@/constants/chains'
import GlobalErrorPopUp from '@/components/GlobalErrorPopUp/GlobalErrorPopUp'
import { getAccessToken } from '@/utils/localStorageService'
import { accountSelectorV2 } from '@/slice/account/account-slice'

import { useLazyGetUserAccountQuerySubscription } from '@/api-v2/account-api'
import { logEvent } from '@/utils/logEvent'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import sadFace from '@/public/svg/icons/sad-face.svg'
import Button from '@/components-v2/atoms/Button'
import { useGetFeatureFlagsQuery } from '@/api-v2/feature-flag'
import Typography from '@/components-v2/atoms/Typography'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { RouteGuard } from '@/components/RouterGuard/RouterGuard'
import { useGetVerifiedCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'

function MyApp(props: AppProps) {
  const router = useRouter()

  // const [triggerSendAnalysis] = useSendAnalysisMutation()
  const logPageView = async (url: string) => {
    await logEvent({
      event: 'page_view',
      payload: {
        page_path: url
      }
    })
  }

  useEffect(() => {
    router.events.on('routeChangeComplete', logPageView)
    return () => {
      router.events.off('routeChangeComplete', logPageView)
    }
  }, [router.events])

  const mainDomain = 'https://app.ledgerx.com'

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta name="description" content="LedgerX - Token transfers made easy" />
        <meta name="theme-color" content="#1FC7D4" />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content={mainDomain} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="LedgerX - Token transfers made easy" />
        <meta property="og:description" content="LedgerX - Token transfers made easy" />
        {/* Twitter Meta Tags */}
        <meta name="twitter:description" content="LedgerX - Token transfers made easy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LedgerX - Token transfers made easy" />
        {/* fonts */}
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="icon" href="/svg/logos/ledgerx-logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />

        <title>LedgerX - Token transfers made easy</title>
      </Head>
      <Providers store={store}>
        <App {...props} />
      </Providers>

      {/* <Script id="hs-script-loader" type="text/javascript" async defer src="//js-na1.hs-scripts.com/24201621.js" /> */}

      <Script id="hs-script-loader" type="text/javascript" async defer src="https://cdn.merge.dev/initialize.js" />
      <Script
        strategy="afterInteractive"
        id="google-tag"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${process.env.NEXT_PUBLIC_GTAG}');
          `
        }}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GTAG}');
        `}
      </Script>
      {process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' && (
        <Script id="hotjar" strategy="lazyOnload">
          {`
          (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3077577,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
        </Script>
      )}
    </>
  )
}

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  Layout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function refreshPage() {
  window.location.pathname = `${window.location.pathname.split('/')[1]}/dashboard`
}

const getErrorBoundaryComponent = () => (
  <div className="flex h-screen justify-center items-center p-[32px]" style={{ backgroundColor: '#FBFAFA' }}>
    <div className="block rounded-lg shadow-lg bg-white font-inter h-full w-full flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-grey-200 h-[80px] w-[80px] flex items-center justify-center">
        <Image src={sadFace} height={30} width={30} alt="Sad Face" />
      </div>
      <div className="mt-6 mb-2">
        <Typography variant="heading1">Oh no, something went wrong</Typography>
      </div>
      <Typography variant="subtitle1" styleVariant="semibold" color="secondary">
        Sorry, there was an unexpected error. Our team has been alerted. We will look into this shortly.
      </Typography>
      <Typography variant="subtitle1" color="secondary" styleVariant="semibold">
        Please refresh the page to continue using our app.
      </Typography>
      <div className="mt-8 mb-8">
        <Button variant="black" height={48} label="Return to homepage" onClick={refreshPage} />
      </div>
      <Typography variant="subtitle2" color="secondary" styleVariant="semibold">
        If you need immediate help, please {/* <a href="https://www.ledgerx.com/contact" className="underline"> */}
        contact us
        {/* </a> */}
      </Typography>
    </div>
  </div>
)

// const ability = new Ability()
// export const AbilityContext = createContext(ability)
// export const Can = createContextualCan(AbilityContext.Consumer)

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  // Use the layout defined at the page level, if available
  useWeb3Listener()
  useGetVerifiedCryptoCurrenciesQuery({})
  const account = useAppSelector(accountSelectorV2)
  const initEventSubmit = useRef(false)

  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const { data: featureFlagData } = useGetFeatureFlagsQuery(
    { organizationId: String(account?.activeOrganizationId), name: 'dtcpay' },
    { skip: !account?.activeOrganizationId }
  )

  const { data: rootfiService } = useGetFeatureFlagsQuery(
    {
      organizationId: String(account?.activeOrganizationId),
      name: 'enable_rootfi_service'
    },
    { skip: !account?.activeOrganizationId }
  )

  const { data } = useGetAuthenticatedProfileQuery(
    {
      orgId: String(account?.activeOrganizationId)
    },
    { skip: !account?.activeOrganizationId }
  )

  const accessToken = getAccessToken()

  const getLayout = Component.Layout || Fragment
  const router = useRouter()
  const [triggerGetAccount] = useLazyGetUserAccountQuerySubscription()

  useEffect(() => {
    if (window.localStorage.getItem(CHAINID)) {
      window.localStorage.removeItem(CHAINID)
    }
  }, [])

  useEffect(() => {
    if (router.query?.promo) {
      Cookies.set('promo-cookie', router.query?.promo, { expires: 14 }) // Expires in 7 days
      if (initEventSubmit.current === false) {
        triggerSendAnalysis({
          eventType: 'PAGE_VIEW',
          metadata: {
            page: router.route
          }
        })
        initEventSubmit.current = true
      }
    }
  }, [router.query])

  const handlePageView = (url) => {
    triggerSendAnalysis({
      eventType: 'PAGE_VIEW',
      metadata: {
        page: url
      }
    })
  }

  useEffect(() => {
    router.events.on('routeChangeComplete', handlePageView)
    return () => {
      router.events.off('routeChangeComplete', handlePageView)
    }
  }, [router.events])

  // SentryUserManagerment
  useEffect(() => {
    if (account) {
      setUser({
        organizationId: account.activeOrganizationId ?? undefined,
        id: account.id ?? undefined,
        username: account.name ?? undefined
      })
    } else {
      setUser(null)
    }
  }, [account])

  useEffect(() => {
    if (!['/multisend'].includes(router.pathname))
      if (!account) {
        if (accessToken) {
          triggerGetAccount()
        }
      }
  }, [accessToken])

  return (
    <ErrorBoundary fallback={getErrorBoundaryComponent()}>
      <RouteGuard userRole={data?.data?.role ?? ''}>{getLayout(<Component {...pageProps} />)}</RouteGuard>
      <ToastContainer theme="colored" style={{ zIndex: 9999 }} />
      <GlobalErrorPopUp />
    </ErrorBoundary>
  )
}

export default MyApp
