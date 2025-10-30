import asyncio
import sentry_sdk

from temporalio.client import Client
from temporalio.worker import Worker

from data_onchain_ingestor.config.config import (
    ADDRESS_SYNC_WORKFLOW_TASK_QUEUE,
    WORKFLOW_SERVER_URI,
    WORKFLOW_NAMESPACE,
    get_logger,
    ENVIRONMENT,
    SENTRY_DSN,
)
from data_onchain_ingestor.workflow.temporal.base.address_schedule_activity import AddressScheduleActivity
from data_onchain_ingestor.workflow.temporal.base.address_schedule_workflow import AddressScheduleWorkflow
from data_onchain_ingestor.workflow.temporal.base.solana_address_activity import SolanaAddressActivity
from data_onchain_ingestor.workflow.temporal.base.solana_address_workflow import SolanaAddressWorkflow


async def main() -> None:
    logger = get_logger(__name__)

    client = await Client.connect(WORKFLOW_SERVER_URI, namespace=WORKFLOW_NAMESPACE)
    worker = Worker(
        client,
        task_queue=ADDRESS_SYNC_WORKFLOW_TASK_QUEUE,
        workflows=[SolanaAddressWorkflow, AddressScheduleWorkflow],
        activities=[SolanaAddressActivity().start, AddressScheduleActivity().trigger_addresses],
    )

    logger.info(f"[TEMPORAL] Started Temporal worker at {WORKFLOW_SERVER_URI}")
    logger.info(f"[TEMPORAL] Namespace: {WORKFLOW_NAMESPACE}")
    logger.info(f"[TEMPORAL] Task Queue: {ADDRESS_SYNC_WORKFLOW_TASK_QUEUE}")
    logger.info(f"[TEMPORAL] Environment: {ENVIRONMENT}")
    logger.info(f"[TEMPORAL] Workflows: {[w.__name__ for w in [SolanaAddressWorkflow, AddressScheduleWorkflow]]}")
    logger.info(f"[TEMPORAL] Activities: SolanaAddressActivity.start, AddressScheduleActivity.trigger_addresses")

    if SENTRY_DSN:
        logger.info(f"[SENTRY] DSN found, initializing {ENVIRONMENT} environment")
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=ENVIRONMENT,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
            enable_tracing=True,
        )
    
    logger.info("[TEMPORAL] Worker starting...")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
