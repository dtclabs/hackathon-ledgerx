import os
from typing import List, Literal, Optional, Union, Tuple, Any, Dict

import polars as pl
import pyarrow as pa
from deltalake import DeltaTable, WriterProperties
from deltalake._internal import TableNotFoundError

from data_onchain_ingestor.config.config import get_logger


class LakeHouse:
    """
    Lakehouse wrapper for Delta Lake (delta-rs) with S3-compatible storage (e.g., Cloudflare R2).
    """

    def __init__(
        self,
        base_storage_uri: str,
        *,
        # You can pass storage_options directly OR provide the 3 R2 params below:
        storage_options: Optional[Dict[str, Any]] = None,
        r2_access_key: Optional[str] = None,
        r2_secret_key: Optional[str] = None,
        r2_endpoint: Optional[str] = None,
    ):
        """
        :param base_storage_uri: e.g. "s3://cdn-30781337-com/delta"
        :param storage_options: delta-rs storage options dict
        :param r2_access_key: Cloudflare R2 Access Key
        :param r2_secret_key: Cloudflare R2 Secret Key
        :param r2_endpoint: Cloudflare R2 endpoint, e.g.
                            "https://20cc506d0eca87eb813bac590e465c55.r2.cloudflarestorage.com"
        """
        self.base_storage_uri = base_storage_uri.rstrip("/")
        self.logger = get_logger(__name__)

        if storage_options is not None:
            self.storage_options = dict(storage_options)
        else:
            # Build from R2 parameters (S3-compatible)
            if not (r2_access_key and r2_secret_key and r2_endpoint):
                raise ValueError(
                    "Either provide 'storage_options' OR all of "
                    "'r2_access_key', 'r2_secret_key', 'r2_endpoint'."
                )
            self.storage_options = {
                # Credentials + endpoint
                "AWS_ACCESS_KEY_ID": r2_access_key,
                "AWS_SECRET_ACCESS_KEY": r2_secret_key,
                "AWS_ENDPOINT": r2_endpoint,
                # R2 usually uses a fake region
                "AWS_REGION": "auto",
                # Some S3-compatible storages don't support atomic rename → enable unsafe rename
                "AWS_S3_ALLOW_UNSAFE_RENAME": "true",
                # R2 works well with virtual-hosted style (default). If it fails, try "path".
                # "AWS_S3_ADDRESSING_STYLE": "virtual",
            }

        self.logger.info(
            f"[LAKEHOUSE] Initialized with base storage URI: {self.base_storage_uri}"
        )

    def _uri(self, name_or_uri: str) -> str:
        # Allow passing either a relative table name or a full s3:// URI
        if name_or_uri.startswith("s3://"):
            return name_or_uri
        return os.path.join(self.base_storage_uri, name_or_uri)

    def write(
        self,
        data: Union[pa.Table, pl.DataFrame],
        name: str,
        unique_keys: List[str],
        mode: Literal["append", "merge"] = "merge",
        partition_by: Optional[List[str]] = None,
        z_order: Optional[List[str]] = None,
    ) -> None:
        """
        Write data to Delta Lake on R2.
        """
        if isinstance(data, pa.Table):
            data = pl.from_arrow(data)

        if data.is_empty():
            self.logger.warning(f"Data is empty. Skipping writing data to {name}")
            return

        table_uri = self._uri(name)

        writer_properties = WriterProperties(
            compression="ZSTD",
            compression_level=3,
            max_row_group_size=100_000,
        )

        delta_write_options = {
            "name": name,
            "writer_properties": writer_properties,
        }

        if partition_by:
            delta_write_options["partition_by"] = partition_by

        self.logger.info(f"Writing data to {table_uri} in {mode} mode")
        match mode:
            case "append":
                data.write_delta(
                    target=table_uri,
                    mode="append",
                    delta_write_options=delta_write_options,
                    storage_options=self.storage_options,
                )

            case "merge":
                predicate_statement = [f"s.{key} = t.{key}" for key in unique_keys]
                predicate = " AND ".join(predicate_statement)
                try:
                    data.write_delta(
                        target=table_uri,
                        mode="merge",
                        delta_merge_options={
                            "predicate": predicate,
                            "source_alias": "s",
                            "target_alias": "t",
                        },
                        delta_write_options=delta_write_options,
                        storage_options=self.storage_options,
                    ).when_matched_update_all().when_not_matched_insert_all().execute()
                except TableNotFoundError:
                    self.logger.warning(
                        f"Table {name} not found. Writing the data in append mode"
                    )
                    data.write_delta(
                        target=table_uri,
                        mode="append",
                        delta_write_options=delta_write_options,
                        storage_options=self.storage_options,
                    )

        if z_order:
            self.z_order(name, z_order)

    def z_order(self, table_uri: str, columns: List[str]) -> None:
        """
        Z-Order the data (Delta-rs optimize).
        """
        table_uri = self._uri(table_uri)
        DeltaTable(table_uri, storage_options=self.storage_options).optimize.z_order(columns)

    def compact(
        self,
        table_uri: str,
        partition_filters: Optional[List[tuple[str, str, str]]] = None,
    ) -> None:
        """
        Small file compaction (Delta-rs optimize).
        """
        table_uri = self._uri(table_uri)
        dt = DeltaTable(table_uri, storage_options=self.storage_options)
        if partition_filters:
            dt.optimize.compact(partition_filters=partition_filters)
        else:
            dt.optimize.compact()

    def vacuum(self, table_uri: str, retention_hours: Optional[int] = 0) -> None:
        """
        Vacuum the table (remove old files).
        """
        table_uri = self._uri(table_uri)
        DeltaTable(table_uri, storage_options=self.storage_options).vacuum(
            retention_hours=retention_hours,
            enforce_retention_duration=False,
            dry_run=False,
        )

    import polars as pl
    from typing import Optional, List, Tuple, Any

    def _to_expr(col: str, op: str, val: Any) -> pl.Expr:
        """
        Convert (col, op, val) into a Polars expression.
        Supports basic operators: =, !=, >, >=, <, <=, in, not in
        """
        match op:
            case "=":
                return pl.col(col) == val
            case "!=":
                return pl.col(col) != val
            case ">":
                return pl.col(col) > val
            case ">=":
                return pl.col(col) >= val
            case "<":
                return pl.col(col) < val
            case "<=":
                return pl.col(col) <= val
            case "in":
                return pl.col(col).is_in(val)
            case "not in":
                return ~pl.col(col).is_in(val)
            case _:
                raise ValueError(f"Unsupported operator: {op}")

    def read(
            self,
            name: str,
            partitions: Optional[List[Tuple[str, str, Any]]] = None,
            filters: Optional[List[Tuple[str, str, Any]]] = None,
            version: Optional[int] = None,
    ) -> pl.DataFrame:
        """
        Read a Delta table with partition pruning and post-scan filtering.

        Args:
            name: Table name or full URI.
            partitions: Predicates for partition columns (e.g. [("date", "=", "2025-09-27")]).
                        These are pushed down to the Delta reader for partition pruning.
            filters: Regular column filters applied after scanning.
            version: Optional version to time travel to.
        """
        table_uri = self._uri(name)

        # Build pyarrow options for partition pruning
        pyarrow_options = {}
        if partitions:
            pyarrow_options["partitions"] = partitions

        # Create lazy scan with partition pushdown if applicable
        lf = pl.scan_delta(
            table_uri,
            storage_options=self.storage_options,
            version=version,
            use_pyarrow=bool(partitions),  # only needed if partitions provided
            pyarrow_options=pyarrow_options if partitions else None,
        )

        # Apply filter expressions after scan
        if filters:
            exprs = [_to_expr(col, op, val) for col, op, val in filters]
            if len(exprs) == 1:
                lf = lf.filter(exprs[0])
            else:
                predicate = exprs[0]
                for e in exprs[1:]:
                    predicate = predicate & e
                lf = lf.filter(predicate)

        # Collect to eager DataFrame
        try:
            return lf.collect()
        except Exception as e:
            self.logger.warning(f"Failed to read table {name}: {e}")
            return pl.DataFrame()


def _to_expr(col: str, op: str, val: Any) -> pl.Expr:
    """
    Convert (col, op, val) into a Polars expression.
    Supports basic operators: =, !=, >, >=, <, <=, in, not in
    """
    match op:
        case "=":
            return pl.col(col) == val
        case "!=":
            return pl.col(col) != val
        case ">":
            return pl.col(col) > val
        case ">=":
            return pl.col(col) >= val
        case "<":
            return pl.col(col) < val
        case "<=":
            return pl.col(col) <= val
        case "in":
            return pl.col(col).is_in(val)
        case "not in":
            return ~pl.col(col).is_in(val)
        case _:
            raise ValueError(f"Unsupported operator: {op}")
