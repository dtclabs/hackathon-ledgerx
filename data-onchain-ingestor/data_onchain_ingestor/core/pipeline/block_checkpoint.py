from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.storage.cache import Cache


class BlockCheckpoint:
    def __init__(self, cache: Cache):
        """
        Initialize the BlockCheckpoint with Redis handler.
        :param cache: An instance of the RedisHandler class for Redis interactions.
        """
        self.cache = cache
        self.logger = get_logger(__name__)

    def update(self, chain_id: str, indexed_address: str, block_number: int) -> bool:
        try:
            self.cache.hset(
                self.get_block_checkpoint_key(chain_id), indexed_address, block_number
            )
            return True
        except Exception as e:
            raise e

    def get(self, chain_id: str, indexed_address: str) -> int:
        try:
            block_number = self.cache.hget(
                self.get_block_checkpoint_key(chain_id), indexed_address
            )
            if block_number is None:
                return 0
            return int(block_number)
        except Exception as e:
            raise e

    @staticmethod
    def get_block_checkpoint_key(chain_id: str) -> str:
        """
        Generate a Redis key for storing the financial transaction count.

        :param chain_id: The blockchain chain ID.
        :param address: The address of the entity.
        :return: A string key for Redis.
        """
        return f"{chain_id}_block_checkpoint"
