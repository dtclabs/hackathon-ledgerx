export enum ExportWorkflowEventType {
  EXPORT_WORKFLOW_GENERATE = 'exportWorkflow.generate'
}

export class ExportWorkflowEvent {
  constructor(public readonly workflowId: string, public readonly organizationId: string) {}
}
