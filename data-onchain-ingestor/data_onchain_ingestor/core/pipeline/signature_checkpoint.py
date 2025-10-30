from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.storage.cache import Cache
from typing import Optional, Tuple


class SignatureCheckpoint:
    def __init__(self, cache: Cache):
        """
        Initialize the SignatureCheckpoint with Redis handler.
        :param cache: An instance of the RedisHandler class for Redis interactions.
        """
        self.cache = cache
        self.logger = get_logger(__name__)

    def update(self, chain_id: str, indexed_address: str, signature: str, slot: int) -> bool:
        """
        Update the signature checkpoint.
        Update 2 field:
        - indexed_address's signature
        - indexed_address's checkpoint block
        """
        try:
            self.cache.hset(
                self.get_signature_checkpoint_key(chain_id), self.get_signature_field(indexed_address), signature
            )
            self.cache.hset(
                self.get_signature_checkpoint_key(chain_id), self.get_slots_field(indexed_address), slot
            )
            self.cache.hset(
                self.get_signature_checkpoint_key(chain_id), self.get_signature_stored_by_address_and_slot(indexed_address, slot), signature
            )
            return True
        except Exception as e:
            raise e

    def get(self, chain_id: str, indexed_address: str) -> Tuple[Optional[str], Optional[int]]:
        try:
            sig = self.cache.hget(
                self.get_signature_checkpoint_key(chain_id), self.get_signature_field(indexed_address)
            )
            lot = self.cache.hget(self.get_signature_checkpoint_key(chain_id), self.get_slots_field(indexed_address))
            return sig, int(lot) if lot else None
        except Exception as e:
            raise e

    def get_signature_by_slot(self, chain_id: str, indexed_address: str, slot: int) -> Optional[str]:
        try:
            sig = self.cache.hget(self.get_signature_checkpoint_key(chain_id), self.get_signature_stored_by_address_and_slot(indexed_address, slot))
            return sig
        except Exception as e:
            raise e

    @staticmethod
    def get_signature_field(indexed_address: str) -> str:
        return f"field_{indexed_address}_signature"

    @staticmethod
    def get_slots_field(indexed_address: str) -> str:
        return f"field_{indexed_address}_slots"

    @staticmethod
    def get_signature_stored_by_address_and_slot(indexed_address: str, slot: int) -> str:
        return f"field_{indexed_address}_{slot}"

    @staticmethod
    def get_signature_checkpoint_key(chain_id: str) -> str:
        """
        Generate a Redis key for storing the financial transaction count.

        :param chain_id: The blockchain chain ID.
        :param address: The address of the entity.
        :return: A string key for Redis.
        """
        return f"{chain_id}_signature_checkpoint"
