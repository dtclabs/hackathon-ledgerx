import { useCallback } from 'react'
import { EventType, EventMetadataMap, createEventPayload } from '@/services/analysis-event.service'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'

const useSendAnalysis = () => {
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  const sendEvent = useCallback(
    <T extends EventType>(eventType: keyof typeof EventType, metadata: EventMetadataMap[T]) => {
      const eventPayload = createEventPayload(EventType[eventType as keyof typeof EventType], metadata)
      triggerSendAnalysis(eventPayload)
    },
    [triggerSendAnalysis]
  )

  return sendEvent
}

export default useSendAnalysis
