from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from data_onchain_ingestor.workflow.temporal.base.address_schedule_activity import (
        AddressScheduleActivity,
    )


@workflow.defn
class AddressScheduleWorkflow:
    @workflow.run
    async def schedule(self) -> None:
        await workflow.execute_activity(
            AddressScheduleActivity().trigger_addresses,
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(
                maximum_attempts=1
            ),
        )
