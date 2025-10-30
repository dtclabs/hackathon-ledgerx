from typing import Optional, Tuple

from temporalio import activity
from datetime import datetime


from data_onchain_ingestor.chains.evm.evm_pipeline import EVMPipeline
from data_onchain_ingestor.chains.providers.hypersync import HyperSync
from data_onchain_ingestor.chains.providers.rpc import RPC
from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import (
    CACHE_HOST,
    DATABASE_URI,
    HYPERSYNC_ENDPOINT,
    LAKEHOUSE_BUCKET,
    get_logger,
    SLACK_TOKEN,
    SLACK_DEFAULT_CHANNEL,
    WORKFLOW_SERVER_URI,
    WORKFLOW_SERVER_PORT,
)
from data_onchain_ingestor.core.notification.slack import SlackNotification
from data_onchain_ingestor.core.pipeline.address_registry import AddressRegistry
from data_onchain_ingestor.core.pipeline.address_status import AddressStatus
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.dto.sync_mode import SyncMode
from data_onchain_ingestor.workflow.dto.address_sync import AddressSync


class EthereumAddressActivity:
    def __init__(self) -> None:
        self.logger = get_logger(__name__)

    @activity.defn
    async def start(
        self, address_sync: AddressSync
    ) -> Tuple[Optional[int], Optional[int]]:
        self.logger.info(f"Params: {address_sync}")

        sync_client = HyperSync(HYPERSYNC_ENDPOINT)
        rpc_client = RPC()

        token_metadata_client = TokenMetadata()
        lakehouse_client = LakeHouse(LAKEHOUSE_BUCKET)
        persistent_client = Persistent(DATABASE_URI)
        cache_client = Cache(host=CACHE_HOST)
        address_registry = AddressRegistry(Chain.ETHEREUM.value, persistent_client)
        notification = SlackNotification(SLACK_TOKEN, SLACK_DEFAULT_CHANNEL)

        if address_sync.sync_mode:
            sync_mode = address_sync.sync_mode
        else:
            address_eligible = address_registry.fetch_eligible_addresses(index_address=address_sync.address)
            sync_mode = SyncMode.INCREMENTAL if address_eligible else SyncMode.HISTORICAL

        self.logger.info(f"[{address_sync.address}] Sync mode: {sync_mode}")

        try:
            if sync_mode == SyncMode.HISTORICAL:
                address_registry.register_job(
                    address_sync.address, address_sync.job_id, AddressStatus.SYNCING
                )
                if activity.info().attempt == 1:
                    notification.send_message(
                        run_id=address_sync.job_id,
                        log_url=self.__get_ui_url(
                            address_sync.address, address_sync.job_id
                        ),
                        title=f"[{sync_mode}][ETH]{address_sync.address}",
                        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        status="SYNCING",
                    )

            pipeline = EVMPipeline(
                sync_client=sync_client,
                rpc_client=rpc_client,
                token_metadata_client=token_metadata_client,
                cache_client=cache_client,
                lakehouse_client=lakehouse_client,
                persistent_client=persistent_client,
                debug_mode=False,
            )

            transaction_count, block_number = await pipeline.start(
                Chain.ETHEREUM.value,
                address_sync.job_id,
                address_sync.address,
                sync_mode,
            )

            if sync_mode == SyncMode.HISTORICAL:
                address_registry.register_job(
                    address_sync.address, address_sync.job_id, AddressStatus.COMPLETED
                )
                address_registry.register([address_sync.address])

                notification.send_message(
                    run_id=address_sync.job_id,
                    log_url=self.__get_ui_url(
                        address_sync.address, address_sync.job_id
                    ),
                    title=f"[{sync_mode.value}][ETH]{address_sync.address}",
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    status="COMPLETED",
                    message_blocks=[
                        {
                            "title": "Retry attempt",
                            "value": str(activity.info().attempt - 1),
                        },
                        {
                            "title": "Transaction count",
                            "value": str(transaction_count),
                        },
                        {
                            "title": "Latest block",
                            "value": str(block_number),
                        },
                    ],
                )

            self.logger.info(f"[{address_sync.address}] Pipeline is succeeded")
            return transaction_count, block_number
        except Exception as e:
            if sync_mode == SyncMode.HISTORICAL:
                address_registry.register_job(
                    address_sync.address, address_sync.job_id, AddressStatus.FAILED
                )

            notification.send_message(
                run_id=address_sync.job_id,
                log_url=self.__get_ui_url(address_sync.address, address_sync.job_id),
                title=f"[{sync_mode.value}][ETH]{address_sync.address}",
                timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                status="TERMINATED",
                message_blocks=[
                    {
                        "title": "Error",
                        "value": str(e),
                    },
                    {
                        "title": "Attempt no:",
                        "value": str(activity.info().attempt),
                    },
                ],
            )
            self.logger.exception(f"Error while processing address {address_sync.address}")
            self.logger.exception(e)
            raise e

    @staticmethod
    def __get_ui_url(address: str, run_id: str) -> str:
        return f"http://{WORKFLOW_SERVER_URI}/namespaces/default/workflows/{address}/{run_id}/history".replace(
            "7233", str(WORKFLOW_SERVER_PORT)
        )
