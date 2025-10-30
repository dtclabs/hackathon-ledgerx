import time
from typing import Optional, Tuple, Iterable, Union, List, Any

import polars as pl
import pyarrow as pa

from concurrent.futures import ThreadPoolExecutor, as_completed
from data_onchain_ingestor.chains.providers.helius import Helius
from data_onchain_ingestor.chains.providers.solana_rpc import SolanaRPC
from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.chains.solana.solana_parser import SolanaParser
from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.pipeline.chain_service import ChainService
from data_onchain_ingestor.core.pipeline.financial_transaction_count import (
    FinancialTransactionCount,
)
from data_onchain_ingestor.core.pipeline.signature_checkpoint import SignatureCheckpoint
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.dto.sync_mode import SyncMode
from data_onchain_ingestor.core.pipeline.token_service import TokenService


class SolanaPipeline:
    SOL_ADDRESS = "So11111111111111111111111111111111111111112"

    def __init__(
            self,
            helius_client: Helius,
            rpc: SolanaRPC,
            token_metadata_client: TokenMetadata,
            cache_client: Cache,
            lakehouse_client: LakeHouse,
            persistent_client: Persistent,
            debug_mode: bool = False,
    ):
        self.helius = helius_client
        self.token_metadata_client = token_metadata_client
        self.cache_client = cache_client
        self.lakehouse_client = lakehouse_client
        self.persistent_client = persistent_client
        self.debug_mode = debug_mode

        self.checkpoint = SignatureCheckpoint(self.cache_client)
        self.rpc = rpc
        self.chain_service = ChainService(lakehouse_client, persistent_client)
        self.logger = get_logger(__name__)

    async def start(
            self,
            chain_id: str,
            run_id: str,
            index_address: str,
            sync_mode: SyncMode = SyncMode.INCREMENTAL,
            from_slot: Optional[int] = None,
            to_slot: Optional[int] = None,
    ) -> Tuple[Optional[int], Optional[int], Optional[str]]:
        # get current synced signature and next slot from checkpoint
        checkpoint_signature, checkpoint_slot = self.checkpoint.get(chain_id, index_address)

        if checkpoint_signature is None or checkpoint_slot is None:
            # cannot None just one of them
            # reset checkpoint signature and checkpoint_slot to start getting data again
            self.logger.warning(f"Checkpoint {checkpoint_signature} or {checkpoint_slot} not found")
            checkpoint_signature = None
            checkpoint_slot = None

        if sync_mode.value == SyncMode.HISTORICAL.value:
            from_slot = from_slot if from_slot is not None else 1
            to_slot = to_slot if to_slot is not None else checkpoint_slot

            # if to_slot:
            #     # get until_signature for to_slot in HISTORICAL mode
            #     until_signature = self.checkpoint.get_signature_by_slot(chain_id, index_address, to_slot)
            # else:
            #     until_signature = checkpoint_signature
            #     checkpoint_signature = None

        self.logger.info(
            f"[{index_address}][Params]from slot: {from_slot} to slot: {to_slot} - checkpoint: {checkpoint_slot} - mode: {sync_mode}"
        )
        try:
            count, next_slot, signature = await self.sync(
                index_address,
                chain_id,
                sync_mode,
                from_slot,
                to_slot,
                checkpoint_signature,
                checkpoint_slot,
            )

            if signature:
                self.checkpoint.update(chain_id, index_address, signature, next_slot)
                self.logger.info(
                    f"Updated checkpoint for {index_address} to {signature}"
                )
            else:
                self.logger.warning(
                    f"Next signature checkpoint is {signature} for {index_address}"
                )
            return count, next_slot, signature
        except Exception as e:
            self.logger.error(f"[{index_address}] Error syncing data: {e}")
            raise e

    async def sync(
            self,
            index_address: str,
            chain_id: str,
            sync_mode: SyncMode,
            from_slot: Optional[int] = None,
            to_slot: Optional[int] = None,
            checkpoint_signature: Optional[str] = None,
            checkpoint_slot: Optional[int] = None,
    ) -> Tuple[Optional[int], Optional[int], Optional[str]]:
        sync_time = time.time()
        if from_slot and checkpoint_slot and from_slot >= checkpoint_slot:
            raise ValueError("Checkpoint block must greater than the from block")
        if to_slot and from_slot >= to_slot:
            raise ValueError("From block must be less than To block")
        # this is to make sure when query data from helius by checkpoint_signature,
        # there is not any missing data
        if to_slot and checkpoint_slot and checkpoint_slot > to_slot:
            raise ValueError("Checkpoint block must be less than the To block")

        stored_transactions, stored_token_transfers, stored_native_transfers = pl.DataFrame(), pl.DataFrame(), pl.DataFrame()

        # get past transactions
        # if historical? -> get data from and to
        # if incremental? ->
        #
        # get historical transactions from ChainService (lakehouse) if from_slot is greater than 0
        if from_slot and from_slot > 0:
            start_time = time.time()
            participants = self.chain_service.query_participants_from_address("transaction_participants", index_address,
                                                                              from_slot, to_slot)
            stored_transactions = self.chain_service.query_transactions_from_participants(
                participants, from_slot, to_slot
            )
            stored_token_transfers = self.chain_service.query_token_transfers_from_participants(
                participants, from_slot, to_slot
            )
            stored_native_transfers = self.chain_service.query_native_transfers_from_participants(
                participants, from_slot, to_slot
            )
            self.logger.info(f"[{index_address}] finished getting stored data in {time.time() - start_time} seconds")

        self.logger.info(
            f"[{index_address}] Submit sync client at checkpoint_block: {from_slot} to_block: {to_slot}"
        )
        import duckdb
        start_time = time.time()

        # TODO: improve this function in order to optimize the sync speed
        results = self.helius.query_all(address=index_address, until=checkpoint_signature)
        self.logger.info(
            f"[{index_address}] Synced data in {time.time() - start_time} seconds"
        )

        # attach transaction index based on slot (block number) to each transaction in transactions
        transactions = attach_tx_index_in_slot(pl.from_arrow(results.transactions), self.rpc)
        native_transfers_df = pl.from_arrow(results.native_transfers)
        token_transfers_df = pl.from_arrow(results.token_transfers)
        token_balance_df = pl.from_arrow(results.token_balance)

        # Check if dataframe has data before querying
        self.logger.info(f"token_balance_df shape: {token_balance_df.shape if token_balance_df is not None else 'None'}")
        self.logger.info(f"token_balance_df columns: {list(token_balance_df.columns) if token_balance_df is not None else 'None'}")
        
        if token_balance_df is not None and not token_balance_df.is_empty() and len(token_balance_df.columns) > 0:
            duckdb.query("select * from token_balance_df").show()
            # Process the dataframe
        else:
            self.logger.warning("token_balance_df is empty or has no columns, skipping DuckDB query")
            # Handle empty case

        if sync_mode.value == SyncMode.INCREMENTAL.value:
            # write data to lakehouse (r2) with merge mode
            self.__store_transactions(transactions)
            self.__store_native_transfers(native_transfers_df)
            self.__store_token_transfers(token_transfers_df)

            # store all transaction's participants
            self.__store_transaction_participants(transactions, token_transfers_df, native_transfers_df)

        # concat stored and helius data into one
        concat_transactions = self.__concat_entity(stored_transactions, transactions)
        concat_token_transfers = self.__concat_entity(stored_token_transfers, token_transfers_df)
        concat_native_transfers = self.__concat_entity(stored_native_transfers, native_transfers_df)

        # Check if concat_native_transfers has data before DuckDB queries
        if not concat_native_transfers.is_empty() and len(concat_native_transfers.columns) > 0:
            duckdb.sql(f"select fromUserAccount, toUserAccount, amount from concat_native_transfers where fromUserAccount='{index_address}' or toUserAccount='{index_address}'").show(max_rows=8000, max_col_width=1000)
            
            query = f"""
            select
            (SUM(
                CASE WHEN 
                    fromUserAccount='{index_address}' THEN
                        amount::uhugeint
                    ELSE -1 * (amount::uhugeint)
                END
            ))::text as sum
            from concat_native_transfers 
            where fromUserAccount='{index_address}' or toUserAccount='{index_address}'
            """
            # Execute query if needed
        else:
            self.logger.warning(f"[{index_address}] No native transfers found, skipping native transfer analysis")

        # get persisted tokens from database
        persisted_tokens_df = None

        # get list of token from token_transfers_df
        tokens = [] if concat_token_transfers.is_empty() or "mint" not in concat_token_transfers.columns else concat_token_transfers.select(
            "mint").unique().to_series().to_list()
        # append solana as default
        tokens.append("solana")

        if len(tokens) > 0:
            token_service = TokenService(
                Chain.SOLANA,
                self.persistent_client,
                self.lakehouse_client,
                self.token_metadata_client,
            )
            persisted_tokens_df = token_service.get_tokens(tokens)

        parser = SolanaParser(
            index_address=index_address,
            transactions=concat_transactions,
            token_metadata=persisted_tokens_df,
            to_slot=to_slot,
            native_transfers=concat_native_transfers,
            token_transfers=concat_token_transfers
        )

        financial_transactions = parser.get_financial_transactions()
        filtered_financial_transactions = parser.filter_financial_transactions(
            financial_transactions
        ).unique()

        if sync_mode.value == SyncMode.INCREMENTAL.value:
            self.persistent_client.write(
                filtered_financial_transactions,
                name="financial_transactions",
                mode="upsert",
                unique_keys=["transaction_id"],
            )
            self.lakehouse_client.write(
                financial_transactions,
                "financial_transactions",
                ["transaction_id"],
                mode="merge",
            )

        parser.get_financial_transactions_aggregate_stats(
            filtered_financial_transactions
        )

        transaction_count: int = filtered_financial_transactions.select(pl.len()).item()

        financial_transaction_count = FinancialTransactionCount(
            self.persistent_client, self.cache_client
        )

        skip_accumulation = True if sync_mode == SyncMode.HISTORICAL else False
        financial_transaction_count.increase(
            chain_id=chain_id,
            indexed_address=index_address,
            count=transaction_count,
            skip_accumulation=skip_accumulation,
        )

        self.logger.info(
            f"[{index_address}] Synced {transaction_count} financial transactions in {time.time() - sync_time} seconds"
        )
        return transaction_count, results.next_slot, results.next_from_signature


    def __concat_entity(
            self,
            stored_entity: Optional[pl.DataFrame],
            entity: Optional[Union[pl.DataFrame, pa.Table]],
    ) -> pl.DataFrame:
        frames: list[pl.DataFrame] = []

        # stored_entity: Polars DF
        if stored_entity is not None and not stored_entity.is_empty():
            self.logger.info("Found stored entity data ...")
            frames.append(stored_entity)

        # entity: có thể là Polars DF hoặc Arrow Table
        if entity is not None:
            if isinstance(entity, pa.Table):
                if entity.num_rows > 0:
                    self.logger.info("Found client entity data (Arrow) ...")
                    frames.append(pl.from_arrow(entity))
            elif isinstance(entity, pl.DataFrame):
                if not entity.is_empty():
                    self.logger.info("Found client entity data (Polars) ...")
                    frames.append(entity)
            else:
                raise TypeError(f"Unsupported type for entity: {type(entity)}")

        if not frames:
            # Return empty DataFrame - let downstream handle it properly
            return pl.DataFrame()

        return pl.concat(frames, how="diagonal_relaxed", rechunk=True)

    def __store_data(self, name: str, data: pl.DataFrame) -> None:
        if data is None or data.is_empty():
            return

        # Ensure slot is Int64
        data = data.with_columns(pl.col("slot").cast(pl.Int64))

        self.logger.info(f"storing transactions, partitioned by slot ...")

        self.lakehouse_client.write(
            data,
            name,
            ["signature"],
            partition_by=["slot"],
        )

    def __store_transactions(self, transactions: pl.DataFrame) -> None:
        """
            Store full transaction data partitioned by slot.
            Unique key is `signature`.
            """
        self.__store_data("transactions", transactions)

    def __store_native_transfers(self, native_transfers: pl.DataFrame) -> None:
        self.__store_data("native_transfers", native_transfers)

    def __store_token_transfers(self, token_transfers: pl.DataFrame) -> None:
        self.__store_data("token_transfers", token_transfers)

    def __store_transaction_participants(self, transactions: pl.DataFrame, token_transfers: pl.DataFrame,
                                         native_transfers: pl.DataFrame):
        """
            Extract all participant addresses from feePayer, native_transfers, and token_transfers.
            Store mapping {participant_address, signature, slot, role}.
            Partition by participant_address.
        """
        if transactions.is_empty():
            return

        # Base: feePayer
        fee_payer_df = transactions.select(
            [
                pl.col("signature"),
                pl.col("slot"),
                pl.col("feePayer").alias("participant_address"),
                pl.lit("fee_payer").alias("role"),
            ]
        )

        frames = [fee_payer_df]

        # Native transfers: extract from/to
        if not native_transfers.is_empty():
            nt_from = native_transfers.select(
                [
                    "signature",
                    "slot",
                    pl.col("fromUserAccount").alias("participant_address"),
                    pl.lit("native_from").alias("role"),
                ]
            )
            nt_to = native_transfers.select(
                [
                    "signature",
                    "slot",
                    pl.col("toUserAccount").alias("participant_address"),
                    pl.lit("native_to").alias("role"),
                ]
            )
            frames.extend([nt_from, nt_to])

        # Token transfers: extract fromUserAccount, toUserAccount
        if not token_transfers.is_empty():
            # exclude SOL transfers
            tt_df = token_transfers.filter(pl.col("mint") != self.SOL_ADDRESS)
            tt_from = tt_df.select(
                [
                    "signature",
                    "slot",
                    pl.col("fromUserAccount").alias("participant_address"),
                    pl.lit("token_from").alias("role"),
                ]
            )
            tt_to = tt_df.select(
                [
                    "signature",
                    "slot",
                    pl.col("toUserAccount").alias("participant_address"),
                    pl.lit("token_to").alias("role"),
                ]
            )
            frames.extend([tt_from, tt_to])

        # concat and dedup
        participants_df = pl.concat(frames, how="diagonal_relaxed", rechunk=True)
        participants_df = participants_df.filter(pl.col("participant_address").is_not_null())
        participants_df = participants_df.unique(
            subset=["participant_address", "signature", "role"]
        )

        self.lakehouse_client.write(
            participants_df,
            "transaction_participants",
            ["participant_address", "signature", "role"],
            partition_by=["participant_address"],
        )


# -----------------------------
# Helpers: mapping slot -> (signature -> index)
# -----------------------------
def _build_map_for_slot(rpc: SolanaRPC, slot: int) -> list[dict]:
    """
    Call get_block(slot) through RPC and return a list of
    [{slot, signature, tx_index_in_slot}]
    """
    blk = rpc.get_block(slot)
    if not blk or not blk.get("transactions"):
        return []
    rows = []
    for idx, tx_entry in enumerate(blk["transactions"]):
        sigs = tx_entry.get("transaction", {}).get("signatures", [])
        if sigs:
            rows.append({"slot": slot, "signature": sigs[0], "tx_index_in_slot": idx})
    return rows


def build_mapping_df(
        rpc: SolanaRPC,
        slots: Iterable[int],
        parallel: bool = True,
        max_workers: int = 8,
        throttle_sec: float = 0.0,  # >0 if you want sequential mode with sleep between calls
) -> pl.DataFrame:
    """
    Return a Polars DataFrame with columns: slot, signature, tx_index_in_slot
    """
    slots = list(slots)
    all_rows: list[dict] = []

    if parallel:
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futs = {ex.submit(_build_map_for_slot, rpc, s): s for s in slots}
            for fut in as_completed(futs):
                rows = fut.result()
                if rows:
                    all_rows.extend(rows)
    else:
        for s in slots:
            all_rows.extend(_build_map_for_slot(rpc, s))
            if throttle_sec > 0:
                time.sleep(throttle_sec)

    if not all_rows:
        return pl.DataFrame({"slot": [], "signature": [], "tx_index_in_slot": []}, infer_schema_length=0)
    return pl.DataFrame(all_rows)


def attach_tx_index_in_slot(
        df: pl.DataFrame,
        rpc: SolanaRPC,
        slot_col: str = "slot",
        sig_col: str = "signature",
        out_col: str = "tx_index_in_slot",
        parallel: bool = True,
        max_workers: int = 8,
) -> pl.DataFrame:
    """
    df must contain:
      - slot (int)
      - signature (str)

    Returns a new DataFrame with an additional column `tx_index_in_slot`.
    """
    if df.is_empty():
        return df

    if slot_col not in df.columns or sig_col not in df.columns:
        raise ValueError(f"DataFrame must contain '{slot_col}' and '{sig_col}' columns.")

    unique_slots = (
        df.select(pl.col(slot_col).drop_nulls().unique().sort())
        .to_series()
        .to_list()
    )

    map_df = build_mapping_df(
        rpc=rpc,
        slots=unique_slots,
        parallel=parallel,
        max_workers=max_workers,
    )
    # Join on (slot, signature)
    df_updated = df.join(map_df, on=[slot_col, sig_col], how="left")
    if out_col != "tx_index_in_slot" and "tx_index_in_slot" in df_updated.columns:
        df_updated = df_updated.rename({"tx_index_in_slot": out_col})

    return df_updated
