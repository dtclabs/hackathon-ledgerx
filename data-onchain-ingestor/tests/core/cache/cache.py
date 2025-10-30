import pytest
from fakeredis import FakeRedis

from data_onchain_ingestor.core.storage.cache import Cache


@pytest.fixture
def redis_client() -> FakeRedis:
    import fakeredis

    redis_client = fakeredis.FakeRedis()
    return redis_client


@pytest.fixture
def cache(redis_client: FakeRedis) -> Cache:
    client = Cache(redis_client=redis_client)
    return client


def test_set_get(cache: Cache) -> None:
    """
    Test the set and get methods of RedisHandler.
    """
    assert cache.set("test_key", "test_value")
    assert cache.get("test_key") == "test_value"


def test_delete(cache: Cache) -> None:
    """
    Test the delete method of RedisHandler.
    """
    cache.set("test_key", "test_value")
    assert cache.delete("test_key")
    assert cache.get("test_key") is None


def test_exists(cache: Cache) -> None:
    """
    Test the exists method of RedisHandler.
    """
    cache.set("test_key", "test_value")
    assert cache.exists("test_key")
    cache.delete("test_key")
    assert not cache.exists("test_key")


def test_expire(cache: Cache) -> None:
    """
    Test the expire method of RedisHandler.
    """
    cache.set("test_key", "test_value")
    assert cache.expire("test_key", 1)
    import time

    time.sleep(2)
    assert not cache.exists("test_key")


def test_hset_hget(cache: Cache) -> None:
    """
    Test that hset returns True when the Redis command succeeds and hget returns the expected value.

    """
    # Test hset method
    heset_result = cache.hset("my_hash", "field1", 1)
    assert heset_result  # Checks if result is True

    # Test hget method
    hget_result = cache.hget("my_hash", "field1")
    assert hget_result is not None  # Checks if result is not None
    assert hget_result == 1  # Checks if result equals 'value1'


def test_hget_not_found(cache: Cache) -> None:
    """
    Test that hget returns the value when the Redis command succeeds.
    """
    result = cache.hget("my_hash", "not_found")
    assert result is None


def test_hdel_success(cache: Cache) -> None:
    """
    Test that hdel returns True when the Redis command succeeds.
    """
    result = cache.hset("my_hash", "hdel_field", "hdel_value")
    assert result is True

    result = cache.hdel("my_hash", "hdel_field")
    assert result is True


def test_hdel_not_found(cache: Cache) -> None:
    """
    Test that hdel returns False when the field does not exist.
    """
    result = cache.hdel("my_hash", "hdel_not_found")
    assert result is False


def test_hgetall_success(cache: Cache) -> None:
    """
    Test that hgetall returns a dictionary when the Redis command succeeds.
    """
    hset_result = cache.hset("hgetall", "hgetall_field_1", "hgetall_value_1")
    assert hset_result is True

    hset_result = cache.hset("hgetall", "hgetall_field_2", "hgetall_value_2")
    assert hset_result is True

    result = cache.hgetall("hgetall")
    assert result == {
        "hgetall_field_1": "hgetall_value_1",
        "hgetall_field_2": "hgetall_value_2",
    }


def test_hgetall_empty(cache: Cache) -> None:
    """
    Test that hgetall returns None when the hash does not exist.
    """
    result = cache.hgetall("hgetall_empty")
    assert result is None


def test_hmset_success(cache: Cache) -> None:
    """
    Test that hmset returns True when the Redis command succeeds.
    """
    hmset_result = cache.hmset(
        "hmset_success", {"field1": "value1", "field2": "value2"}
    )
    assert hmset_result is True

    result = cache.hgetall("hmset_success")
    assert result == {"field1": "value1", "field2": "value2"}
