import logging
import time
from typing import Any, List, Literal, Union

import polars as pl
from sqlalchemy import CursorResult, create_engine, text

from ..utility.exception_handler import handle_exception
from ...config.config import get_logger

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Persistent:
    def __init__(self, database_uri: str, schema: str = "public"):
        self.database_uri = database_uri
        self.sqlalchemy_engine = create_engine(database_uri, future=True)
        self.schema = schema

        self.logger = get_logger(__name__)

    @handle_exception("error while calling persistent.write")
    def write(
        self,
        data: Union[pl.DataFrame, pl.LazyFrame, List[dict[str, Any]]],
        name: str,
        mode: Literal["append", "upsert", "upsert-do-nothing"],
        unique_keys: List[str],
    ) -> None:
        """
        Write data to the database - use SQLAlchemy as an engine. See https://docs.pola.rs/api/python/stable/reference/api/polars.DataFrame.write_database.html
        :param data: Polars DataFrame to be written
        :param name: Name of the table
        :param mode: Mode of writing the data
        :param unique_keys: field that matched whether conflict occurs
        :return:
        """
        if isinstance(data, list):
            if len(data) == 0:
                self.logger.warning(f"No data to write for table {name}")
                return
            data = pl.DataFrame(data)
        elif isinstance(data, pl.LazyFrame):
            data = data.collect()
            if len(data) == 0:
                self.logger.warning(f"No data to write for table {name}")
                return

        match mode:
            case "append":
                return self.__append_data(data, name, unique_keys)
            case "upsert":
                return self.__upsert(data, name, unique_keys)
            case "upsert-do-nothing":
                return self.__upsert(data, name, unique_keys, "do-nothing")
            case _:
                raise ValueError(f"Invalid mode {mode}")

    def __append_data(
        self, data: pl.DataFrame, name: str, unique_keys: List[str]
    ) -> None:
        """
        Create a table or insert data to existing table
        :param data: DataFrame to be inserted
        :param name: Name of the table
        :param unique_keys: Unique keys to be checked for duplication
        """
        data = data.unique(subset=unique_keys)
        with self.sqlalchemy_engine.connect() as connection:
            connection.begin()
            data.write_database(
                table_name=f"{self.schema}.{name}",
                connection=connection,
                if_table_exists="append",
                engine="sqlalchemy",
            )
            connection.commit()

    def __upsert(
        self,
        data: pl.DataFrame,
        main_table_name: str,
        unique_keys: List[str],
        mode: str = "update",
    ) -> None:
        """
        Upsert data to the database
        :param data: DataFrame to be upserted
        :param main_table_name: Name of the main table that will be upserted from temporary table
        :param unique_keys: field that matched whether conflict occurs
        :return:
        """
        if unique_keys is None:
            raise ValueError("unique_keys cannot be None")

        temporary_table_name = f"{main_table_name}_{time.time_ns()}"
        with self.sqlalchemy_engine.connect() as connection:
            connection.begin()

            # load data to temporary table
            data.to_pandas().to_sql(
                f"{temporary_table_name}",
                connection,
                schema="pg_temp",
                if_exists="append",
                index=False,
            )

            query = f"""
                INSERT INTO {main_table_name}({', '.join(data.columns)}) SELECT {', '.join(data.columns)} FROM pg_temp.{temporary_table_name}
                ON CONFLICT ({", ".join(unique_keys)})
                """
            if mode == "update":
                query += f"DO UPDATE SET {', '.join([f'{field} = EXCLUDED.{field}' for field in data.columns if field not in unique_keys])}, updated_at = now()"
            elif mode == "do-nothing":
                query += "DO NOTHING"
            connection.execute(text(query))
            connection.commit()

    @handle_exception("error while calling persistent.execute_many")
    def execute_many(self, queries: List[str]) -> None:
        with self.sqlalchemy_engine.connect() as connection:
            connection.begin()
            for query in queries:
                connection.execute(text(query))
            connection.commit()

    @handle_exception("error while calling persistent.execute")
    def execute(self, query: str) -> CursorResult[Any]:
        with self.sqlalchemy_engine.connect() as connection:
            connection.begin()
            result = connection.execute(text(query))
            connection.commit()
            return result

    def read(self, query: str) -> pl.DataFrame:
        return pl.read_database_uri(query, self.database_uri, engine="adbc")
