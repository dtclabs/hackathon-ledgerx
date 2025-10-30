import * as Sentry from '@sentry/node'
import { expressIntegration } from '@sentry/node'

// Conditionally import profiling with error handling
let nodeProfilingIntegration: any = null
try {
  const profilingModule = require('@sentry/profiling-node')
  nodeProfilingIntegration = profilingModule.nodeProfilingIntegration
} catch (error) {
  console.warn('Sentry profiling not available:', error.message)
}

export async function instrumentSentry() {
  // Read more about the available options here: https://docs.sentry.io/platforms/javascript/guides/nestjs/configuration/options/
  if (!process.env.SENTRY_DSN) {
    return
  }

  Sentry.init({
    // Advanced, optional: Called for message and error events
    beforeSend(event) {
      // Modify or drop the event here
      if (event.request?.url?.toLowerCase().includes('health') || event.request?.url?.toLowerCase().includes('hello')) {
        return null
      }

      return event
    },

    // Transaction with profiling cost 1.3 instead of 1.0,
    // you can add more profiling here for example Prisma or postgresql
    // Advanced, optional: Called for transaction events, you can further debug your transactions here
    beforeSendTransaction: function (event) {
      // Modify or drop the event here
      if (event.request?.url?.toLowerCase().includes('health') || event.request?.url?.toLowerCase().includes('hello')) {
        return null
      }

      return event
    },

    // Enable debug mode to log event submission
    debug: false,

    dsn: process.env.SENTRY_DSN,

    enabled: true,

    // Set the environment & release version
    environment: process.env.DEPLOYMENT_ENV,
    integrations: (process.env.DEPLOYMENT_ENV === 'production' && nodeProfilingIntegration)
      ? [nodeProfilingIntegration]
      : [],

    profilesSampleRate: (process.env.DEPLOYMENT_ENV === 'production' && nodeProfilingIntegration) ? 1.0 : 0,
    tracesSampleRate: process.env.DEPLOYMENT_ENV === 'production' ? 1.0 : 0.1,

    release: `${process.env.npm_package_name}@${process.env.npm_package_version}`
  })

  Sentry.addIntegration(expressIntegration())
  Sentry.addIntegration(Sentry.postgresIntegration())
  Sentry.addIntegration(Sentry.captureConsoleIntegration())
  Sentry.addIntegration(Sentry.redisIntegration())
  Sentry.addIntegration(Sentry.nodeContextIntegration())
}

instrumentSentry()
