export interface CreateAnalysisDto extends ICreateAnalysis {
  userAgent: string
}

interface ICreateAnalysis {
  url: string
  event: string
  referrer?: string
  payload: any
}
