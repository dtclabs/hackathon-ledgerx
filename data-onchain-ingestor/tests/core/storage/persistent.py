from typing import Any

import polars as pl
import psycopg
import pytest
from sqlalchemy import text

from data_onchain_ingestor.core.storage.persistent import Persistent

# Mock data for testing
mock_pandas_data = pl.DataFrame({"column1": [1, 2], "column2": [3, 4]})


@pytest.fixture
def persistent(postgresql: psycopg.Connection[Any]) -> Persistent:
    connection = f"postgresql+psycopg2://{postgresql.info.user}:@{postgresql.info.host}:{postgresql.info.port}/{postgresql.info.dbname}"
    return Persistent(connection)


def test_write_with_invalid_mode(persistent: Persistent) -> None:
    with pytest.raises(ValueError, match="Invalid mode invalid_mode"):
        persistent.write(mock_pandas_data, "main_table", "invalid_mode", ["id"])


def test_write(persistent: Persistent) -> None:
    mock_data = pl.DataFrame({"id": [1], "column1": [3], "column2": [5]})
    mock_data_1 = pl.DataFrame({"id": [2], "column1": [1], "column2": [2]})
    mock_data_2 = pl.DataFrame({"id": [2], "column1": [1], "column2": [3]})
    with persistent.sqlalchemy_engine.connect() as conn:
        conn.begin()
        conn.execute(
            text(
                "CREATE TABLE public.test_table (id INTEGER PRIMARY KEY, column1 INTEGER, "
                "column2 INTEGER, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
        )
        conn.commit()

    persistent.write(mock_data, "test_table", "append", ["id"])

    persistent.write(
        mock_data_1,
        "test_table",
        "upsert",
        ["id"],
    )

    with persistent.sqlalchemy_engine.connect() as conn:
        results = conn.execute(text("SELECT * FROM public.test_table")).all()
        assert len(results) == 2
        assert results[0][:3] == (1, 3, 5)
        assert results[1][:3] == (2, 1, 2)

    persistent.write(mock_data_2, "test_table", "upsert", ["id"])

    with persistent.sqlalchemy_engine.connect() as conn:
        results = conn.execute(text("SELECT * FROM public.test_table")).all()
        assert len(results) == 2
        assert results[0][:3] == (1, 3, 5)
        assert results[1][:3] == (2, 1, 3)
