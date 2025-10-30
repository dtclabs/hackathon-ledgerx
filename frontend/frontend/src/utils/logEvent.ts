import { logEventApi } from '@/api/analysis/analysisApi'

export const logEvent = async ({ event, payload, referrer }: { event: string; payload: any; referrer?: string }) => {
  if (typeof window !== 'undefined')
    await logEventApi({
      event,
      payload,
      referrer,
      url: window.location.href,
      userAgent: window.navigator.userAgent
    })
}
