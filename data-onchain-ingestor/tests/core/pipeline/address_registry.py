from typing import Any

import psycopg
import pytest

from data_onchain_ingestor.core.pipeline.address_registry import AddressRegistry
from data_onchain_ingestor.core.pipeline.address_status import AddressStatus
from data_onchain_ingestor.core.pipeline.sync_mode import SyncMode
from data_onchain_ingestor.core.storage.persistent import Persistent
from data_onchain_ingestor.dto.address_registry import (
    AddressRegistry as AddressRegistryDTO,
)
from data_onchain_ingestor.dto.job_registry import JobRegistry as JobRegistryDTO


@pytest.fixture
def persistent(postgresql: psycopg.Connection[Any]) -> Persistent:
    connection = f"postgresql+psycopg2://{postgresql.info.user}:@{postgresql.info.host}:{postgresql.info.port}/{postgresql.info.dbname}"
    return Persistent(connection)


@pytest.fixture
def address_registry(persistent: Persistent) -> AddressRegistry:
    return AddressRegistry(chain_id="test_chain", persistent=persistent)


def setup_address_registry_table(persistent: Persistent) -> None:
    persistent.execute(f"""
    CREATE TABLE {persistent.schema}.{AddressRegistryDTO.table_name()} (
        register_id TEXT PRIMARY KEY,
        chain_id TEXT,
        indexed_address TEXT,
        status INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
    """)


def setup_job_registry_table(persistent: Persistent) -> None:
    persistent.execute(f"""
    CREATE TABLE {persistent.schema}.{JobRegistryDTO.table_name()} (
        id SERIAL PRIMARY KEY,
        run_id TEXT UNIQUE,
        chain_id TEXT,
        indexed_address TEXT,
        status INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
    """)


@pytest.fixture(autouse=True)
def setup_tables(persistent: Persistent) -> None:
    setup_address_registry_table(persistent)
    setup_job_registry_table(persistent)
    yield
    persistent.execute_many(
        [
            f"DROP TABLE {persistent.schema}.{AddressRegistryDTO.table_name()}",
            f"DROP TABLE {persistent.schema}.{JobRegistryDTO.table_name()}",
        ]
    )


def test_update(address_registry: AddressRegistry, persistent: Persistent) -> None:
    addresses = ["addr1", "addr2"]
    status = AddressStatus.RESERVED

    # update addresses status
    address_registry.update(addresses, status)

    result = (
        persistent.execute(
            f"SELECT * FROM {persistent.schema}.{AddressRegistryDTO.table_name()}"
        )
        .mappings()
        .all()
    )
    assert len(result) == 2
    for row in result:
        assert row["chain_id"] == "test_chain"
        assert row["status"] == status.value


def test_register(address_registry: AddressRegistry, persistent: Persistent) -> None:
    addresses = ["addr1", "addr2"]

    # register addresses
    address_registry.register(addresses)

    result = (
        persistent.execute(
            f"SELECT * FROM {persistent.schema}.{AddressRegistryDTO.table_name()}"
        )
        .mappings()
        .all()
    )
    assert len(result) == 2
    for row in result:
        assert row["chain_id"] == "test_chain"
        assert row["status"] == AddressStatus.RESERVED.value


def test_fetch_eligible_addresses(
    address_registry: AddressRegistry, persistent: Persistent
) -> None:
    # Insert fake data into address registry table
    persistent.execute(f"""
        INSERT INTO {persistent.schema}.{AddressRegistryDTO.table_name()} (register_id, chain_id, indexed_address, status)
        VALUES
        ('id1', 'test_chain', 'addr1', {AddressStatus.QUEUED.value}),
        ('id2', 'test_chain', 'addr2', {AddressStatus.COMPLETED.value}),
        ('id3', 'test_chain', 'addr3', {AddressStatus.FAILED.value})
        """)

    addresses = address_registry.fetch_eligible_addresses(SyncMode.INCREMENTAL)
    assert addresses == ["addr1", "addr2", "addr3"]


def test_get_registered_address_data_frame(address_registry: AddressRegistry) -> None:
    addresses = ["addr1", "addr2"]
    status = AddressStatus.RESERVED

    df = address_registry.__get_registered_address_data_frame(addresses, status)
    assert df.shape == (2, 4)
    assert list(df.columns) == ["register_id", "chain_id", "indexed_address", "status"]
    assert df["status"].to_list() == [status.value, status.value]
