/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-var-requires */

const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const withPWA = require('next-pwa')({
  dest: 'public', // Where service worker + manifest output go
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // Disable in dev
})

const sentryWebpackPluginOptions = {
  silent: true,
  dryRun: !process.env.SENTRY_AUTH_TOKEN
}

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,

  ...(!process.env.FAST === 'true' && {
    compiler: {
      removeConsole: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    }
  }),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**' // Allow all remote images (adjust for security if needed)
      }
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_URL + '/:path*'
        }
      ]
    }
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ]
  },

  output: 'standalone'
}

const isFast = process.env.FAST === 'true'

let finalConfig = baseConfig

// Chain plugins properly (order matters!)
if (!isFast) {
  finalConfig = withPWA(withBundleAnalyzer(withSentryConfig(baseConfig, sentryWebpackPluginOptions)))
} else {
  finalConfig = withPWA(baseConfig)
}

module.exports = finalConfig
