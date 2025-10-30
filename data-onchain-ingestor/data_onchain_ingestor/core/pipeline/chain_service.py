from typing import Optional, List, Tuple, Any
import polars as pl

from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent


class ChainService:
    def __init__(self, lakehouse_client: LakeHouse, persistent_client: Persistent):
        self.lakehouse_client = lakehouse_client
        self.persistent_client = persistent_client
        self.logger = get_logger(__name__)

    def query_from_lakehouse(
        self,
        name: str,
        partitions: Optional[List[Tuple[str, str, str]]],
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        block_number_column_name = "number" if name == "blocks" else "block_number"

        from_block = from_block or 0
        filters = [(block_number_column_name, ">=", from_block)]

        if to_block:
            filters.append((block_number_column_name, "<", to_block))

        return self.lakehouse_client.read(name, partitions=partitions, filters=filters)

    @staticmethod
    def get_slot_filters(from_block: Optional[int] = None, to_block: Optional[int] = None) -> List[Tuple[str, str, Any]]:
        slot_column_name = "slot"
        filters = [(slot_column_name, ">=", from_block)]
        if to_block:
            filters.append((slot_column_name, "<", to_block))
        return filters

    def query_participants_from_address(
        self,
        name: str,
        address: str,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        partitions = [("participant_address", "=", address)]
        filters = self.get_slot_filters(from_block=from_block, to_block=to_block)
        return self.lakehouse_client.read(name, partitions=partitions, filters=filters)

    def query_data_from_participants(
        self,
        name: str,
        participants: pl.DataFrame,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        try:
            if participants.is_empty():
                return pl.DataFrame()

            # get signatures to join with transactions
            sigs = participants.select("signature").unique()
            signatures = sigs["signature"].to_list()

            # read transactions from sig
            data = self.lakehouse_client.read(
                name,
                partitions=self.get_slot_filters(from_block=from_block, to_block=to_block),
                filters=[("signature", "in", signatures)],
            )

            if data.is_empty():
                return pl.DataFrame()

            data = data.sort("slot")
            return data
        except Exception as e:
            self.logger.error(f"Exception while querying data from participants: {e}")
            return pl.DataFrame()

    def query_native_transfers_from_participants(
        self,
        participants: pl.DataFrame,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        return self.query_data_from_participants("native_transfers", participants, from_block=from_block, to_block=to_block)

    def query_transactions_from_participants(
        self,
        participants: pl.DataFrame,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        return self.query_data_from_participants("transactions", participants, from_block=from_block, to_block=to_block)

    def query_token_transfers_from_participants(
        self,
        participants: pl.DataFrame,
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
    ) -> pl.DataFrame:
        return self.query_data_from_participants("token_transfers", participants, from_block=from_block, to_block=to_block)
