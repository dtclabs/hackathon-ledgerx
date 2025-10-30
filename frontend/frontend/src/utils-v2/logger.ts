import { Severity, withScope as withSentryScope, captureMessage as sentryCaptureMessage, setTag } from '@sentry/nextjs'
import { Context } from '@sentry/types'

interface ITag {
    name: string
    value: string
}

/**
 * @param message Message displayed on Sentry
 * @param level Severity level for the log event
 * @param fingerprint This is meant to tell Sentry how to group similar events
 * optional @param context Additional context an event needs to log
 * optional @param transactionName Useful for grouping transactions + a quick overview on the Sentry list
 */

/* eslint-disable prefer-arrow-callback */
const logToSentry = (level:Severity, message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) => {
    withSentryScope(function (scope) {
        scope.setFingerprint(fingerprint)
        scope.setLevel(level)
        if (context) {
            scope.setContext('HQ Context', context)
        }
        if (transactionName) {
            scope.setTransactionName(transactionName)
        }
        if (tagObject) {
            scope.setTag(tagObject.name, tagObject.value)
        }
        sentryCaptureMessage(message)
    })
}

function logDebugToSentry (message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) {
    logToSentry(Severity.Debug, message, fingerprint, context, transactionName, tagObject)
}

function logInfoToSentry (message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) {
    logToSentry(Severity.Info, message, fingerprint, context, transactionName, tagObject)
}

function logWarningToSentry (message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) {
    logToSentry(Severity.Warning, message, fingerprint, context, transactionName, tagObject)
}

function logErrorToSentry (message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) {
    logToSentry(Severity.Error, message, fingerprint, context, transactionName, tagObject)
}

function logCriticialErrorToSentry (message:string, fingerprint:string[], context?: Context, transactionName?: string, tagObject?: ITag) {
    logToSentry(Severity.Critical, message, fingerprint, context, transactionName, tagObject)
}

export const log = {
    debug: logDebugToSentry,
    info: logInfoToSentry,
    warning: logWarningToSentry,
    error: logErrorToSentry,
    critical: logCriticialErrorToSentry
}