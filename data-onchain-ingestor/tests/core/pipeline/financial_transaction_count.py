from typing import Any, Callable
from unittest.mock import MagicMock

import psycopg
import pytest
from fakeredis import FakeRedis

from data_onchain_ingestor.core.pipeline.financial_transaction_count import (
    FinancialTransactionCount,
)
from data_onchain_ingestor.core.storage.cache import Cache
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.dto.financial_transaction_count import (
    FinancialTransactionCount as FinancialTransactionCountDTO,
)


@pytest.fixture
def persistent(postgresql: psycopg.Connection) -> Persistent:
    connection = f"postgresql+psycopg2://{postgresql.info.user}:@{postgresql.info.host}:{postgresql.info.port}/{postgresql.info.dbname}"
    return Persistent(connection)


@pytest.fixture
def redis_client() -> FakeRedis:
    import fakeredis

    redis_client = fakeredis.FakeRedis()
    return redis_client


@pytest.fixture
def cache(redis_client: FakeRedis) -> Cache:
    client = Cache(redis_client=redis_client)
    return client


@pytest.fixture
def financial_transaction_count(
    persistent: Persistent, cache: Cache
) -> FinancialTransactionCount:
    """Fixture to provide a FinancialTransactionCount instance."""
    return FinancialTransactionCount(persistent=persistent, cache=cache)


@pytest.fixture
def mock_persistent(persistent: Persistent) -> MagicMock:
    """Fixture to provide a mock Persistent object."""
    return MagicMock(wraps=persistent)


@pytest.fixture
def mock_redis(cache: Cache) -> MagicMock:
    """Fixture to provide a mock Persistent object."""
    return MagicMock(wraps=cache)


@pytest.fixture(autouse=True)
def wrapper(persistent: Persistent, cache: Cache, mock_persistent: MagicMock) -> None:
    persistent.execute("""
        create table public.financial_transaction_count
        (
            id                          serial primary key,
            indexed_address             varchar not null,
            financial_transaction_count integer,
            chain_id                    varchar not null,
            updated_at timestamp without time zone,
            UNIQUE (chain_id, indexed_address)
        )
    """)
    yield
    persistent.execute("DROP TABLE public.financial_transaction_count")


def execute_and_raise_exception(
    func: Callable[..., Any], **kwargs: dict[str, Any]
) -> Exception | None:
    try:
        func(**kwargs)
        return None
    except Exception as e:
        return e


def test_update_success(financial_transaction_count: FinancialTransactionCount) -> None:
    """Test the update method for success scenario."""
    financial_transaction_count.increase(
        chain_id="chain1", indexed_address="address1", count=100
    )

    # get value from redis
    redis_result = financial_transaction_count.cache.get(
        FinancialTransactionCount.get_financial_transaction_count_key(
            "chain1", "address1"
        )
    )
    assert redis_result == "100"

    # get value from database
    db_result = (
        financial_transaction_count.persistent.execute(
            f"SELECT * FROM {financial_transaction_count.persistent.schema}.{FinancialTransactionCountDTO.table_name()} "
            f"WHERE CHAIN_ID='chain1' AND INDEXED_ADDRESS='address1'"
        )
        .mappings()
        .fetchone()
    )
    assert db_result is not None
    assert db_result["financial_transaction_count"] == 100


def test_update_failure(mock_redis: MagicMock, mock_persistent: MagicMock) -> None:
    """Test the update method for failure scenario."""
    # Create a mock FinancialTransactionCountDTO
    financial_transaction_count = FinancialTransactionCount(
        persistent=mock_persistent, cache=mock_redis
    )
    # Mock the database write operation to raise an exception
    financial_transaction_count.persistent.schema = "public"
    financial_transaction_count.persistent.write.side_effect = Exception(  # type: ignore
        "Database error"
    )

    # call update function
    exception = execute_and_raise_exception(
        financial_transaction_count.increase,
        **dict(chain_id="chain1", indexed_address="address1", count=100),
    )
    assert str(exception) == "Database error"


def test_get_from_redis_success(
    mock_persistent: MagicMock,
    redis_client: Cache,
) -> None:
    """Test the get method when data is retrieved from Redis."""
    financial_transaction_count = FinancialTransactionCount(
        persistent=mock_persistent, cache=redis_client
    )
    key = FinancialTransactionCount.get_financial_transaction_count_key(
        "chain1", "address1"
    )
    assert redis_client.set(key, 100) is True
    count = financial_transaction_count.get("chain1", "address1")
    assert count is not None
    assert count == 100
    financial_transaction_count.persistent.execute.assert_not_called()  # type: ignore


def test_get_from_db_and_no_cache_found(
    persistent: Persistent, mock_redis: MagicMock, redis_client: Cache
) -> None:
    """Test the get method when data is retrieved from the database."""
    # Create a mock FinancialTransactionCountDTO
    key = FinancialTransactionCount.get_financial_transaction_count_key(
        "chain1", "address1"
    )
    financial_transaction_count = FinancialTransactionCount(
        persistent=persistent, cache=mock_redis
    )

    # mock redis
    financial_transaction_count.cache.set.return_value = True  # type: ignore

    # setup data
    assert (
        execute_and_raise_exception(
            financial_transaction_count.increase,
            **dict(chain_id="chain1", indexed_address="address1", count=100),
        )
        is None
    )

    # init real financial transaction count
    financial_transaction_count = FinancialTransactionCount(
        persistent=persistent, cache=redis_client
    )
    count = financial_transaction_count.get("chain1", "address1")

    # Assertions
    assert count is not None
    assert count == 100

    cache_result = redis_client.get(key)
    assert cache_result is not None
    assert int(cache_result) == 100


def test_get_failure(mock_redis: MagicMock, mock_persistent: MagicMock) -> None:
    """Test the get method for failure scenario."""
    financial_transaction_count = FinancialTransactionCount(
        persistent=mock_persistent, cache=mock_redis
    )

    # Mock Redis get operation to return None (simulate cache miss)
    financial_transaction_count.cache.get.return_value = None  # type: ignore
    # Mock database query to raise an exception
    # financial_transaction_count.persistent.execute.side_effect = Exception(
    #     "Database error"
    # )
    financial_transaction_count.persistent.schema = "public"

    assert (
        str(
            execute_and_raise_exception(
                financial_transaction_count.get,
                **dict(chain_id="chain1", indexed_address="address1"),
            )
        )
        == "Database error"
    )

    # Assertions
    financial_transaction_count.cache.get.assert_called_once_with(  # type: ignore
        "chain1_address1_tx_count"
    )
    financial_transaction_count.persistent.execute.assert_called_once_with(  # type: ignore
        "SELECT * FROM public.financial_transaction_count "
        "WHERE CHAIN_ID = 'chain1' AND INDEXED_ADDRESS = 'address1'"
    )
    financial_transaction_count.cache.set.assert_not_called()  # type: ignore


def test_increment_financial_transaction_count_twice(
    financial_transaction_count: FinancialTransactionCount,
) -> None:
    assert (
        execute_and_raise_exception(
            financial_transaction_count.increase,
            **dict(chain_id="chain1", indexed_address="address1", count=100),
        )
        is None
    )

    assert (
        execute_and_raise_exception(
            financial_transaction_count.increase,
            **dict(chain_id="chain1", indexed_address="address1", count=100),
        )
        is None
    )

    count = financial_transaction_count.get("chain1", "address1")
    assert count is not None
    assert count == 200


def test_increment_financial_transaction_count_not_found(
    financial_transaction_count: FinancialTransactionCount,
) -> None:
    assert (
        execute_and_raise_exception(
            financial_transaction_count.increase,
            **dict(chain_id="chain1", indexed_address="address1", count=100),
        )
        is None
    )
    count = financial_transaction_count.get("chain1", "address1")
    assert count is not None
    assert count == 100
