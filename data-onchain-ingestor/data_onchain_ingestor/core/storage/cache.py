from typing import Any, Dict, Optional

import redis

from data_onchain_ingestor.config.config import get_logger, CACHE_HOST


class Cache:
    def __init__(
        self,
        host: str = CACHE_HOST,
        port: int = 6379,
        db: int = 0,
        redis_client: Optional[redis.Redis] = None,  # type: ignore
    ) -> None:
        """
        Initialize the RedisHandler with a connection to the Redis server.

        :param host: The Redis server host.
        :param port: The Redis server port.
        :param db: The Redis database number.
        :param redis_client: An existing Redis client instance (optional).
        """
        if redis_client is None:
            self.redis_client = redis.StrictRedis(
                host=host, port=port, db=db, decode_responses=True
            )
        else:
            self.redis_client = redis_client

        self.logger = get_logger(__name__)

    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """
        Set the value of a key.

        :param key: The key to set.
        :param value: The value to set.
        :param ex: The expiration time in seconds (optional).
        :return: True if the operation was successful, otherwise False.
        """
        try:
            self.redis_client.set(key, value, ex=ex)
            return True
        except redis.RedisError as e:
            self.logger.error(f"Error setting key {key}: {e}")
            return False

    def get(self, key: str) -> Optional[str]:
        """
        Get the value of a key.

        :param key: The key to get.
        :return: The value of the key, or None if the key does not exist.
        """
        try:
            value = self.redis_client.get(key)
            if value is not None:
                return bytes(value, encoding="utf8").decode()  # Decode bytes to string
            return None
        except redis.RedisError as e:
            self.logger.error(f"Error getting key {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        """
        Delete a key.

        :param key: The key to delete.
        :return: True if the key was deleted, otherwise False.
        """
        try:
            result = self.redis_client.delete(key)
            return int(result) > 0
        except redis.RedisError as e:
            self.logger.error(f"Error deleting key {key}: {e}")
            return False

    def exists(self, key: str) -> bool:
        """
        Check if a key exists.

        :param key: The key to check.
        :return: True if the key exists, otherwise False.
        """
        try:
            result = self.redis_client.exists(key)
            return int(result) > 0
        except redis.RedisError as e:
            self.logger.error(f"Error checking existence of key {key}: {e}")
            return False

    def expire(self, key: str, time: int) -> bool:
        """
        Set a key's time to live in seconds.

        :param key: The key to set the expiration time for.
        :param time: The expiration time in seconds.
        :return: True if the expiration time was set, otherwise False.
        """
        try:
            result = self.redis_client.expire(key, time)
            return bool(result)
        except redis.RedisError as e:
            self.logger.error(f"Error setting expiration time for key {key}: {e}")
            return False

    def flush(self) -> bool:
        """
        Flush the Redis database.

        :return: True if the database was flushed, otherwise False.
        """
        try:
            self.redis_client.flushdb()
            return True
        except redis.RedisError as e:
            self.logger.error(f"Error flushing database: {e}")
            return False

    # Hash map methods
    def hset(self, key: str, field: str, value: Any) -> bool:
        """
        Set the value of a field in a hash.

        :param key: The key of the hash.
        :param field: The field to set.
        :param value: The value to set.
        :return: True if the operation was successful, otherwise False.
        """
        try:
            self.redis_client.hset(key, field, value)
            return True
        except redis.RedisError as e:
            self.logger.error(f"Error setting field {field} in hash {key}: {e}")
            return False

    def hget(self, key: str, field: str) -> Optional[str]:
        """
        Get the value of a field in a hash.

        :param key: The key of the hash.
        :param field: The field to get.
        :return: The value of the field, or None if the field does not exist.
        """
        try:
            value = self.redis_client.hget(key, field)
            if value is not None:
                return bytes(value, encoding="utf8").decode()
            return None
        except redis.RedisError as e:
            self.logger.error(f"Error getting field {field} from hash {key}: {e}")
            return None

    def hdel(self, key: str, field: str) -> bool:
        """
        Delete a field from a hash.

        :param key: The key of the hash.
        :param field: The field to delete.
        :return: True if the field was deleted, otherwise False.
        """
        try:
            result = self.redis_client.hdel(key, field)
            return int(result) > 0
        except redis.RedisError as e:
            self.logger.error(f"Error deleting field {field} from hash {key}: {e}")
            return False

    def hgetall(self, key: str) -> Optional[Dict[str, str]]:
        """
        Get all fields and values from a hash.

        :param key: The key of the hash.
        :return: A dictionary of field-value pairs, or None if the hash does not exist.
        """
        try:
            fields = self.redis_client.hgetall(key)
            if fields:
                return {bytes(k).decode(): bytes(v).decode() for k, v in fields.items()}
            return None
        except redis.RedisError as e:
            self.logger.error(f"Error getting all fields from hash {key}: {e}")
            return None

    def hmset(self, key: str, mapping: Dict[str, Any]) -> bool:
        """
        Set multiple fields in a hash.

        :param key: The key of the hash.
        :param mapping: A dictionary of field-value pairs to set.
        :return: True if the operation was successful, otherwise False.
        """
        try:
            self.redis_client.hmset(key, mapping)
            return True
        except redis.RedisError as e:
            self.logger.error(f"Error setting multiple fields in hash {key}: {e}")
            return False
