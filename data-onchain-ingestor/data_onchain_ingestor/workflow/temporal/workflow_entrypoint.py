import asyncio

from temporalio.client import Client

from data_onchain_ingestor.config.config import (
    ADDRESS_SYNC_WORKFLOW_TASK_QUEUE,
    WORKFLOW_SERVER_URI,
)

from data_onchain_ingestor.workflow.dto.workflow_address_sync import WorkflowAddressSync
from data_onchain_ingestor.workflow.temporal.base.solana_address_workflow import SolanaAddressWorkflow


async def main() -> None:
    print(f"Connecting to Temporal server {WORKFLOW_SERVER_URI}")

    sample_address = "updtkJ8HAhh3rSkBCd3p9Z1Q74yJW4rMhSbScRskDPM"
    client = await Client.connect(WORKFLOW_SERVER_URI)
    address_sync = WorkflowAddressSync(address=sample_address)

    await client.execute_workflow(
        SolanaAddressWorkflow.run,
        address_sync,
        id=sample_address,
        task_queue=ADDRESS_SYNC_WORKFLOW_TASK_QUEUE,
    )


if __name__ == "__main__":
    asyncio.run(main())
