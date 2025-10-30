import asyncio

import polars as pl
from data_onchain_ingestor.chains.providers.helius import Helius
from data_onchain_ingestor.chains.providers.solana_rpc import SolanaRPC
from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.chains.solana.solana_pipeline import SolanaPipeline
from data_onchain_ingestor.core.pipeline.sync_mode import SyncMode
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent

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
    R2_ENDPOINT
)

async def main() -> None:

    token_metadata_client = TokenMetadata()
    lake = LakeHouse(
        base_storage_uri=LAKEHOUSE_BUCKET,
        r2_access_key=R2_ACCESS_KEY,
        r2_secret_key=R2_SECRET_KEY,
        r2_endpoint=R2_ENDPOINT,
    )
    persistent_client = Persistent(
        "postgresql://postgres:docker@localhost:5432/postgres"
    )
    cache_client = Cache()
    rpc = SolanaRPC(rpc_url=RPC_URL)
    helius = Helius(api_key=HELIUS_API_KEY)

    pipeline = SolanaPipeline(
        token_metadata_client=token_metadata_client,
        cache_client=cache_client,
        lakehouse_client=lake,
        persistent_client=persistent_client,
        debug_mode=True,
        rpc=rpc,
        helius_client=helius,
    )

    await pipeline.start(
        # index_address="2Yhn6rA3Kp4kt5BtRT5kWw2gmMBgY4L63JWXPyMr91TZ",
        run_id="",
        index_address="2Yhn6rA3Kp4kt5BtRT5kWw2gmMBgY4L63JWXPyMr91TZ",
        chain_id="",
        # checkpoint_block=7051111,
        # from_slot=1,
        # to_block=7051115,
        sync_mode=SyncMode.INCREMENTAL,
    )
    # data = lake.read(
    #     name="transaction_participants",
    #     partitions=[("participant_address", "=", "2Yhn6rA3Kp4kt5BtRT5kWw2gmMBgY4L63JWXPyMr91TZ")],
    #     # filters=[("slot", ">=", 1), ("slot", "<=", 329877327)],
    # )
    # import duckdb
    # duckdb.sql("select * from data order by slot").show(max_rows=3000)
    # result = helius.query_all(address="2Yhn6rA3Kp4kt5BtRT5kWw2gmMBgY4L63JWXPyMr91TZ")
    # transactions = pl.from_arrow(result.transactions)
    #
    # import duckdb
    # duckdb.sql("select * from transactions").show(max_rows=3000, max_width=1000)



if __name__ == "__main__":
    asyncio.run(main())
