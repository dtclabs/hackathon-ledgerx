from datetime import timedelta

from temporalio import activity
from temporalio.client import Client
from temporalio.common import RetryPolicy

from data_onchain_ingestor.config.config import get_logger, DATABASE_URI, SUPPORTED_CHAINS, WORKFLOW_SERVER_URI, \
    ADDRESS_SYNC_WORKFLOW_TASK_QUEUE
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.core.pipeline.address_registry import AddressRegistry
from data_onchain_ingestor.workflow.dto.workflow_address_sync import WorkflowAddressSync
from data_onchain_ingestor.workflow.temporal.base.solana_address_workflow import SolanaAddressWorkflow


class AddressScheduleActivity:
    def __init__(self) -> None:
        self.logger = get_logger(__name__)

    @activity.defn
    async def trigger_addresses(self) -> None:
        persistent_client = Persistent(DATABASE_URI)

        client = await Client.connect(WORKFLOW_SERVER_URI)

        for chain in SUPPORTED_CHAINS:
            address_registry = AddressRegistry(chain.value, persistent_client)
            addresses = address_registry.fetch_eligible_addresses()
            for address in addresses:
                await client.start_workflow(
                    SolanaAddressWorkflow.run,
                    WorkflowAddressSync(address=address),
                    id=address,
                    task_queue=ADDRESS_SYNC_WORKFLOW_TASK_QUEUE,
                    retry_policy=RetryPolicy(
                        maximum_attempts=2,
                        maximum_interval=timedelta(seconds=60),
                        backoff_coefficient=2,
                    ),
                )
