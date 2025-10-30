from typing import Optional, Tuple
from temporalio import activity
from datetime import datetime

from data_onchain_ingestor.chains.solana.solana_pipeline import SolanaPipeline
from data_onchain_ingestor.chains.providers.helius import Helius
from data_onchain_ingestor.chains.providers.solana_rpc import SolanaRPC
from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import (
    CACHE_HOST,
    DATABASE_URI,
    LAKEHOUSE_BUCKET,
    get_logger,
    SLACK_TOKEN,
    SLACK_DEFAULT_CHANNEL,
    WORKFLOW_SERVER_URI,
    WORKFLOW_SERVER_PORT,
    RPC_URL,
    HELIUS_API_KEY,
    SLACK_ENABLED,
    R2_ACCESS_KEY,
    R2_SECRET_KEY,
    R2_ENDPOINT,
    WEBHOOK_ENDPOINT
)
from data_onchain_ingestor.core.notification.slack import SlackNotification
from data_onchain_ingestor.core.pipeline.address_registry import AddressRegistry
from data_onchain_ingestor.core.pipeline.address_status import AddressStatus
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.core.utility.webhook import WebhookResponder
from data_onchain_ingestor.dto.sync_mode import SyncMode
from data_onchain_ingestor.workflow.dto.address_sync import AddressSync


class SolanaAddressActivity:
    def __init__(self) -> None:
        self.webhook = WebhookResponder(WEBHOOK_ENDPOINT)
        self.logger = get_logger(__name__)

    @activity.defn
    async def start(
            self, address_sync: AddressSync
    ) -> Tuple[Optional[int], Optional[int]]:
        self.logger.info(f"[SOLANA] Params: {address_sync}")

        # --- Khởi tạo clients ---
        helius_client = Helius(api_key=HELIUS_API_KEY)
        rpc_client = SolanaRPC(RPC_URL)

        token_metadata_client = TokenMetadata()
        lakehouse_client = LakeHouse(
            base_storage_uri=LAKEHOUSE_BUCKET,
            r2_access_key=R2_ACCESS_KEY,
            r2_secret_key=R2_SECRET_KEY,
            r2_endpoint=R2_ENDPOINT,
        )
        persistent_client = Persistent(DATABASE_URI)
        cache_client = Cache(host=CACHE_HOST)
        address_registry = AddressRegistry(Chain.SOLANA.value, persistent_client)
        notification = SlackNotification(SLACK_TOKEN, SLACK_DEFAULT_CHANNEL, enabled=SLACK_ENABLED)

        if address_sync.sync_mode:
            sync_mode = address_sync.sync_mode
        else:
            address_eligible = address_registry.fetch_eligible_addresses(
                index_address=address_sync.address
            )
            sync_mode = SyncMode.INCREMENTAL if address_eligible else SyncMode.HISTORICAL

        self.logger.info(f"[{address_sync.address}][SOL] Sync mode: {sync_mode}")

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
                        title=f"[{sync_mode.value}][SOL]{address_sync.address}",
                        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        status="SYNCING",
                    )

            pipeline = SolanaPipeline(
                helius_client=helius_client,
                rpc=rpc_client,
                token_metadata_client=token_metadata_client,
                cache_client=cache_client,
                lakehouse_client=lakehouse_client,
                persistent_client=persistent_client,
                debug_mode=False,
            )

            transaction_count, last_slot, last_signature = await pipeline.start(
                Chain.SOLANA.value,
                address_sync.job_id,
                address_sync.address,
                sync_mode,
            )

            await self.webhook.send_response(address_sync.address, {
                "transaction_count": transaction_count,
                "last_slot": last_slot,
                "last_signature": last_signature,
            })

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
                    title=f"[{sync_mode.value}][SOL]{address_sync.address}",
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
                            "title": "Last processed slot",
                            "value": str(last_slot),
                        },
                    ],
                )

            self.logger.info(f"[{address_sync.address}][SOL] Pipeline succeeded")
            return transaction_count, last_slot

        except Exception as e:
            if sync_mode == SyncMode.HISTORICAL:
                address_registry.register_job(
                    address_sync.address, address_sync.job_id, AddressStatus.FAILED
                )

            notification.send_message(
                run_id=address_sync.job_id,
                log_url=self.__get_ui_url(address_sync.address, address_sync.job_id),
                title=f"[{sync_mode.value}][SOL]{address_sync.address}",
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

            await self.webhook.send_response(address_sync.address, {
                "message": str(e)
            }, "FAILED")

            self.logger.exception(f"Error while processing SOL address {address_sync.address}")
            self.logger.exception(e)
            raise e

    @staticmethod
    def __get_ui_url(address: str, run_id: str) -> str:
        return f"http://{WORKFLOW_SERVER_URI}/namespaces/default/workflows/{address}/{run_id}/history".replace(
            "7233", str(WORKFLOW_SERVER_PORT)
        )
