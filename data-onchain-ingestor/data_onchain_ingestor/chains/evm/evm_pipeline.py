import time
from typing import Optional, Tuple

import polars as pl
import pyarrow as pa

from data_onchain_ingestor.chains.evm.ethereum.ethereum_parser import EthereumParser
from data_onchain_ingestor.chains.providers.hypersync import HyperSync
from data_onchain_ingestor.chains.providers.rpc import RPC
from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.pipeline.block_checkpoint import BlockCheckpoint
from data_onchain_ingestor.core.pipeline.chain_service import ChainService
from data_onchain_ingestor.core.pipeline.financial_transaction_count import (
    FinancialTransactionCount,
)
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.dto.sync_mode import SyncMode
from data_onchain_ingestor.core.pipeline.token_service import TokenService


class EVMPipeline:
    def __init__(
        self,
        sync_client: HyperSync,
        rpc_client: RPC,
        token_metadata_client: TokenMetadata,
        cache_client: Cache,
        lakehouse_client: LakeHouse,
        persistent_client: Persistent,
        debug_mode: bool = False,
    ):
        self.sync_client = sync_client
        self.rpc_client = rpc_client
        self.token_metadata_client = token_metadata_client
        self.cache_client = cache_client
        self.lakehouse_client = lakehouse_client
        self.persistent_client = persistent_client
        self.debug_mode = debug_mode

        self.checkpoint = BlockCheckpoint(self.cache_client)

        self.logger = get_logger(__name__)

    async def start(
        self,
        chain_id: str,
        run_id: str,
        index_address: str,
        sync_mode: SyncMode,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
        reconcile_native_balance: bool = False,
        reconcile_token_balance: bool = False,
    ) -> Tuple[Optional[int], Optional[int]]:
        if sync_mode == SyncMode.HISTORICAL:
            from_block = 0
        elif from_block is None:
            from_block = self.checkpoint.get(chain_id, index_address)

        checkpoint_block = self.checkpoint.get(chain_id, index_address)
        self.logger.info(
            f"[{index_address}][Params]from block: {from_block} to block: {to_block} - checkpoint: {checkpoint_block} - mode: {sync_mode}"
        )
        self.logger.info(
            f"[{index_address}] Reconcile native balance: {reconcile_native_balance} - Reconcile token balance: {reconcile_token_balance}"
        )
        try:
            count, next_block = await self.sync(
                index_address,
                chain_id,
                sync_mode,
                from_block,
                to_block,
                checkpoint_block,
                reconcile_native_balance,
                reconcile_token_balance,
            )

            if next_block:
                self.checkpoint.update(chain_id, index_address, next_block)
                self.logger.info(
                    f"Updated checkpoint for {index_address} to {next_block}"
                )
            else:
                self.logger.warning(
                    f"Next block checkpoint is {next_block} for {index_address}. Keep checkpoint at {from_block}"
                )
            return count, next_block
        except Exception as e:
            self.logger.error(f"[{index_address}] Error syncing data: {e}")
            raise e

    async def sync(
        self,
        index_address: str,
        chain_id: str,
        sync_mode: SyncMode,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
        checkpoint_block: int = 0,
        reconcile_native_balance: bool = False,
        reconcile_token_balance: bool = False,
    ) -> Tuple[Optional[int], Optional[int]]:
        if from_block and checkpoint_block <= from_block:
            raise ValueError("Checkpoint block must greater than the from block")

        if from_block and to_block and from_block >= to_block:
            raise ValueError("From block must be less than To block")

        if to_block and checkpoint_block >= to_block:
            raise ValueError("Checkpoint block must be less than the To block")

        stored_blocks = pl.DataFrame()
        stored_transactions = pl.DataFrame()
        stored_logs = pl.DataFrame()
        stored_traces = pl.DataFrame()
        if checkpoint_block != 0:
            chain_service = ChainService(self.lakehouse_client, self.persistent_client)
            stored_blocks = chain_service.query_from_lakehouse(
                "blocks", index_address, from_block, checkpoint_block
            )
            stored_transactions = chain_service.query_from_lakehouse(
                "transactions", index_address, from_block, checkpoint_block
            )
            stored_logs = chain_service.query_from_lakehouse(
                "logs", index_address, from_block, checkpoint_block
            )
            stored_traces = chain_service.query_from_lakehouse(
                "traces", index_address, from_block, checkpoint_block
            )

        self.logger.info(
            f"[{index_address}] Submit sync client at checkpoint_block: {checkpoint_block} to_block: {to_block}"
        )
        query = self.sync_client.get_query(
            index_addresses=[index_address],
            from_block=checkpoint_block,
            to_block=to_block,
        )

        start_time = time.time()
        (
            blocks,
            transactions,
            logs,
            traces,
            next_block,
        ) = await self.sync_client.execute_query(query, index_address)
        self.logger.info(
            f"[{index_address}] Synced data in {time.time() - start_time} seconds"
        )

        balances_df = None
        if not blocks or blocks.num_rows == 0:
            self.logger.warning(
                f"[{index_address}] No blocks found for the given query"
            )
        else:
            self.lakehouse_client.write(
                blocks,
                "blocks",
                ["number"],
                mode="merge",
                partition_by=["index_address"],
            )
            self.lakehouse_client.write(
                transactions,
                "transactions",
                ["hash"],
                mode="merge",
                partition_by=["index_address"],
            )
            self.lakehouse_client.write(
                logs,
                "logs",
                ["transaction_hash", "log_index"],
                mode="merge",
                partition_by=["index_address"],
            )
            self.lakehouse_client.write(
                traces,
                "traces",
                ["transaction_hash", "trace_index"],
                mode="merge",
                partition_by=["index_address"],
            )

        concat_blocks = self.__concat_entity(stored_blocks, blocks)
        if concat_blocks.is_empty():
            # The validation based on JOIN mode which must have blocks along other entities otherwise it is empty
            self.logger.warning(
                f"[{index_address}] No data found for the given param at this time"
            )
            return 0, next_block

        concat_transactions = self.__concat_entity(stored_transactions, transactions)
        concat_logs = self.__concat_entity(stored_logs, logs)
        concat_traces = self.__concat_entity(stored_traces, traces)

        if reconcile_native_balance:
            self.logger.info(f"[{index_address}] Reconciling native balance")
            block_number_params = (
                pl.from_arrow(blocks)
                .select("number")
                .unique()
                .get_column("number")
                .to_list()
            )
            block_numbers = self.rpc_client.get_balances(
                index_address, block_number_params
            )
            balances_df = pl.DataFrame(block_numbers)
            self.lakehouse_client.write(
                balances_df,
                "block_balances",
                ["block_number", "index_address"],
                mode="merge",
            )

        if reconcile_token_balance:
            self.logger.info(f"[{index_address}] Reconciling token balance")
            # To be implemented
            ...

        # get persisted tokens from database
        persisted_tokens_df = None
        new_tokens = (
            concat_logs.select("address").unique().get_column("address").to_list()
        )
        if len(new_tokens) > 0:
            token_service = TokenService(
                self.persistent_client,
                self.lakehouse_client,
                self.token_metadata_client,
            )
            persisted_tokens_df = token_service.get_tokens(new_tokens, chain_id)

        # get mock uncles and withdrawals data, set enabled=True to get data
        # otherwise, empty data is returned
        uncles, withdrawals = self.__get_uncles_withdrawals_mock_data(
            index_address, enabled=False
        )

        parser = EthereumParser(
            index_address=index_address,
            blocks=concat_blocks,
            transactions=concat_transactions,
            logs=concat_logs,
            traces=concat_traces,
            token_metadata=persisted_tokens_df,
            debug_mode=False,
            uncles=uncles,
            withdrawals=withdrawals,
        )

        financial_transactions = parser.get_financial_transactions(
            balances_df=balances_df
        )
        filtered_financial_transactions = parser.filter_financial_transactions(
            financial_transactions
        ).unique()

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
            f"[{index_address}] Synced {transaction_count} financial transactions"
        )
        return transaction_count, next_block

    def __concat_entity(
        self, stored_entity: pl.DataFrame, entity: pa.Table
    ) -> pl.DataFrame:
        pre_concat_entity = []
        if not stored_entity.is_empty():
            self.logger.info("Found stored entity data ...")
            pre_concat_entity.append(stored_entity)
        if entity:
            self.logger.info("Found client entity data ...")
            pre_concat_entity.append(pl.from_arrow(entity))

        if not pre_concat_entity:
            return pl.DataFrame()

        return pl.concat(pre_concat_entity, how="diagonal_relaxed", rechunk=True)

    def __get_uncles_withdrawals_mock_data(
        self, indexed_address: str, enabled: bool = False
    ) -> Tuple[pl.DataFrame, pl.DataFrame]:
        if not enabled:
            return pl.DataFrame(), pl.DataFrame()

        uncles = {
            "block_number": [7051114],
            "block_hash": [
                "0x3ab1717bc254173a8b11d755f5534eb0ad256d655a75b189a8a1e96b5254af76",
            ],
            "uncle_block_number": [7051112],
            "uncle_miner": [indexed_address],
        }

        withdrawals = {
            "block_number": [7051114, 7051114],
            "block_hash": [
                "0x3ab1717bc254173a8b11d755f5534eb0ad256d655a75b189a8a1e96b5254af76",
                "0x3ab1717bc254173a8b11d755f5534eb0ad256d655a75b189a8a1e96b5254af76",
            ],
            "address": [indexed_address, indexed_address],
            "index": [53931387, 53931388],
            "amount": [188304719, 18646797],
        }

        return pl.DataFrame(uncles), pl.DataFrame(withdrawals)
