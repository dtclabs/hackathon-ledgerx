from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

from data_onchain_ingestor.workflow.dto.address_sync import AddressSync


from data_onchain_ingestor.workflow.dto.workflow_address_sync import WorkflowAddressSync

with workflow.unsafe.imports_passed_through():
    from data_onchain_ingestor.workflow.temporal.base.ethereum_address_activity import (
        EthereumAddressActivity,
    )


@workflow.defn
class EthereumAddressWorkflow:
    @workflow.run
    async def run(self, address_sync: WorkflowAddressSync) -> str:
        await workflow.execute_activity(
            EthereumAddressActivity().start,
            AddressSync(
                address=address_sync.address,
                job_id=workflow.info().run_id
            ),
            start_to_close_timeout=timedelta(hours=3),
            retry_policy=RetryPolicy(
                maximum_attempts=3,
                maximum_interval=timedelta(seconds=60),
                backoff_coefficient=3,
            ),
        )
        return address_sync.address
