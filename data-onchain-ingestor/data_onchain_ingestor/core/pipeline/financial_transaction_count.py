from typing import Optional

from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.core.utility.exception_handler import handle_exception
from data_onchain_ingestor.dto.financial_transaction_count import (
    FinancialTransactionCount as FinancialTransactionCountDTO,
)


class FinancialTransactionCount:
    def __init__(self, persistent: Persistent, cache: Cache):
        """
        Initialize the FinancialTransactionCount with persistent storage and Redis handler.

        :param persistent: An instance of the Persistent class for database interactions.
        :param cache: An instance of the RedisHandler class for Redis interactions.
        """
        self.persistent = persistent
        self.cache = cache
        self.logger = get_logger(__name__)

    @handle_exception("error while updating financial transaction count to DB")
    def __update_to_db(self, tx: FinancialTransactionCountDTO) -> None:
        """
        Update the financial transaction count into the database.

        :param tx: An instance of FinancialTransactionCountDTO containing transaction details.
        :return: True if the update is successful, otherwise False.
        """
        # Write transaction count data to the database
        self.persistent.write(
            data=[tx.dict()],
            name=tx.table_name(),
            mode="upsert",
            unique_keys=tx.unique_keys(),
        )

    @handle_exception("error while updating financial transaction count to cache")
    def __update_to_cache(self, tx: FinancialTransactionCountDTO) -> None:
        """
        Update the financial transaction count into the cache.

        :param tx: An instance of FinancialTransactionCountDTO containing transaction details.
        :return: True if the update is successful, otherwise False.
        """
        # Store transaction count in the cache with a generated key
        self.cache.set(
            self.get_financial_transaction_count_key(tx.chain_id, tx.indexed_address),
            tx.financial_transaction_count,
        )

    @handle_exception("error while getting financial transaction count")
    def get(self, chain_id: str, indexed_address: str) -> Optional[int]:
        """
        Retrieve the financial transaction count from the cache or the database.

        :param chain_id: The blockchain chain ID.
        :param indexed_address: The address of the entity.
        :return: An instance of FinancialTransactionCountDTO with the updated financial transaction count, or None if not found.
        """
        key = self.get_financial_transaction_count_key(chain_id, indexed_address)
        # Try to get the transaction count from the cache
        tx_count = self.cache.get(key)
        if tx_count is not None:
            return int(tx_count)
        else:
            # If not in the cache, get the transaction count from the database
            result = (
                self.persistent.execute(
                    f"SELECT * FROM {self.persistent.schema}.{FinancialTransactionCountDTO.table_name()} "
                    f"WHERE CHAIN_ID = '{chain_id}' AND INDEXED_ADDRESS = '{indexed_address}'"
                )
                .mappings()
                .fetchone()
            )
            if result is not None:
                financial_transaction_count = result["financial_transaction_count"]
                # Update the cache with the fetched data
                self.cache.set(key, financial_transaction_count)
                return int(financial_transaction_count)
        return None

    def increase(
        self,
        chain_id: str,
        indexed_address: str,
        count: int,
        skip_accumulation: bool = False,
    ) -> None:
        """
        Increment the financial transaction count by a specified amount.

        :param chain_id: The blockchain chain ID.
        :param indexed_address: The address of the entity.
        :param count: The amount to increment the transaction count by.
        :param skip_accumulation: A boolean flag to skip the accumulation of the transaction count.
        :return: An instance of FinancialTransactionCountDTO with the incremented financial transaction count, or a new instance if not found.
        """
        tx = FinancialTransactionCountDTO(
            chain_id=chain_id,
            indexed_address=indexed_address,
            financial_transaction_count=count,
        )
        if skip_accumulation:
            tx_count = self.get(chain_id, indexed_address)
            if tx_count is not None:
                tx.financial_transaction_count += tx_count

        # save tx to cache and db
        self.__update_to_db(tx)
        self.__update_to_cache(tx)

    @staticmethod
    def get_financial_transaction_count_key(chain_id: str, address: str) -> str:
        """
        Generate a Redis key for storing the financial transaction count.

        :param chain_id: The blockchain chain ID.
        :param address: The address of the entity.
        :return: A string key for Redis.
        """
        return f"{chain_id}_{address}_tx_count"
