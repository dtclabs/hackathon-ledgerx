from typing import Optional, List, Union, Iterable

import duckdb
import polars as pl
import pyarrow as pa

from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.utility.hash import generate_hash
from data_onchain_ingestor.dto.financial_transaction_event_type import FinancialTransactionEventType


# ==== Helpers for schema-safe operations ====

FIN_SCHEMA = {
    "transaction_id": pl.String,
    "abstracted_index": pl.String,
    "hash": pl.String,
    "block_number": pl.Int64,
    "from": pl.String,
    "to": pl.String,
    "symbol": pl.String,
    "amount": pl.String,
    "fee": pl.Float64,
    "decimals": pl.Int64,
    "kind": pl.String,
    "type": pl.String,
    "address": pl.String,
}

FIN_OUT_SCHEMA = {
    "transaction_id": pl.String,
    "abstracted_index": pl.String,
    "hash": pl.String,
    "block_number": pl.Int64,
    "symbol": pl.String,
    "amount": pl.String,
    "fee": pl.Float64,
    "decimals": pl.Int64,
    "kind": pl.String,
    "type": pl.String,
    "address": pl.String,
    "index_address": pl.String,
    "blockchain_id": pl.String,
    "from_address": pl.String,
    "to_address": pl.String,
    "timestamp": pl.UInt32,
}


def _empty_financial_lf() -> pl.LazyFrame:
    """
    Return an empty LazyFrame with the expected financial transaction schema.
    This ensures downstream transformations do not break when there is no data.
    """
    return pl.DataFrame(schema=FIN_SCHEMA).lazy()


def _is_schema_empty(lf: pl.LazyFrame) -> bool:
    """
    Check if the LazyFrame has an empty schema.
    LazyFrame.schema is always available without collecting the data.
    """
    return len(lf.collect_schema().names()) == 0


def _safe_concat_financial(lfs: list[pl.LazyFrame]) -> pl.LazyFrame:
    """
    Concatenate multiple LazyFrames while ignoring those with empty schemas.
    Ensures stable schema alignment for financial transaction data.
    """
    lfs = [lf for lf in lfs if not _is_schema_empty(lf)]
    if not lfs:
        return _empty_financial_lf()
    return pl.concat(lfs, how="diagonal", rechunk=True)


def _add_slot(tf: pl.LazyFrame, lf: pl.LazyFrame) -> pl.LazyFrame:
    """
    Join transaction-related data (slot, tx_index_in_slot) into a transfer DataFrame.

    If the base transaction LazyFrame is empty or missing the required columns,
    inject nulls for slot and tx_index_in_slot to preserve schema.
    """
    if _is_schema_empty(lf) or not {"signature", "slot", "tx_index_in_slot"}.issubset(
        set(lf.columns)
    ):
        return tf.with_columns(
            pl.lit(None).cast(pl.Int64).alias("slot"),
            pl.lit(None).cast(pl.Int64).alias("tx_index_in_slot"),
        )

    return tf.join(
        lf.select("signature", "slot", "tx_index_in_slot"),
        on="signature",
        how="left",
    )


class SolanaParser:
    """
    A parser for Solana transaction data, responsible for normalizing fee,
    native, and token transfer events into a unified financial transaction format.
    """

    NATIVE_SYMBOL = "SOL"
    NATIVE_DECIMALS = 9
    WSOL = "So11111111111111111111111111111111111111112"
    SOL = "solana"

    def __init__(
        self,
        index_address: str,
        transactions: pl.DataFrame,
        token_metadata: Union[pl.DataFrame, pl.LazyFrame],
        to_slot: Optional[int],
        native_transfers: Union[pa.Table, pl.DataFrame, pl.LazyFrame],
        token_transfers: Union[pa.Table, pl.DataFrame, pl.LazyFrame],
    ):
        self.index_address = index_address
        self.transactions = SolanaParser.__convert_to_frame(transactions)
        self.token_metadata = SolanaParser.__convert_to_frame(token_metadata)
        self.to_slot = to_slot
        self.native_transfers = SolanaParser.__convert_to_frame(native_transfers)
        self.token_transfers = SolanaParser.__convert_to_frame(token_transfers)
        self.finance_transactions: Optional[pl.DataFrame] = None
        self.logger = get_logger(__name__)

    @staticmethod
    def __convert_to_frame(
        data: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
    ) -> pl.LazyFrame:
        """
        Convert various input data formats into a Polars LazyFrame.
        Supports Arrow tables, delta paths, DataFrames, and LazyFrames.
        """
        if data is None:
            return pl.LazyFrame()
        if isinstance(data, pa.Table):
            return pl.from_arrow(data).lazy()
        elif isinstance(data, str):
            return pl.scan_delta(data)
        elif isinstance(data, pl.DataFrame):
            return data.lazy()
        return data

    def get_financial_transactions(
        self,
        sort_by: Optional[List[str]] = ["timestamp"],
    ) -> pl.DataFrame:
        """
        Build a unified financial transaction table by parsing and merging
        fees, native transfers, and token transfers. Joins with transaction
        timestamps where available.

        :param sort_by: Columns to sort the final DataFrame by (default: timestamp)
        :return: Polars DataFrame of financial transactions
        """
        if self.finance_transactions is not None:
            return self.finance_transactions

        parsed_fee = self.get_parsed_transactions_fee()
        parsed_native = self.get_parsed_native_transfer_transactions()
        parsed_tokens = self.get_parsed_token_transfers_transactions()

        fin_lf = _safe_concat_financial([parsed_fee, parsed_tokens, parsed_native])
        tx_cols = set(self.transactions.collect_schema().names())
        can_join = not _is_schema_empty(self.transactions) and {"slot", "timestamp"}.issubset(tx_cols)
        if can_join:
            tx_sel = self.transactions.select(
                [pl.col("slot").alias("block_number"), "timestamp"]
            )
            fin_lf = fin_lf.join(tx_sel, on="block_number", how="inner")
        else:
            # Fallback: inject null timestamps if join isn't possible
            fin_lf = fin_lf.with_columns(
                pl.lit(None).cast(pl.UInt32).alias("timestamp")
            )

        fin_lf = fin_lf.with_columns(
            [
                pl.lit(self.index_address).alias("index_address"),
                pl.lit(Chain.SOLANA.value).alias("blockchain_id"),
                pl.col("from").alias("from_address"),
                pl.col("to").alias("to_address"),
                pl.col("fee").cast(pl.Float64),
                pl.col("decimals").cast(pl.Int8),
                pl.col("block_number").cast(pl.Int64),
                pl.col("timestamp").cast(pl.UInt32),
            ]
        ).drop(["from", "to"])

        df = fin_lf.collect()

        if df.is_empty():
            self.logger.warning("No financial transactions found, data is empty")
            self.finance_transactions = pl.DataFrame(schema=FIN_OUT_SCHEMA)
            return self.finance_transactions

        if sort_by:
            df = df.sort(sort_by, descending=True)

        self.finance_transactions = df
        return df

    def get_parsed_native_transfer_transactions(self) -> pl.LazyFrame:
        """
        Parse native SOL transfers and normalize them into the standard financial schema.
        Each transfer is assigned a deterministic transaction ID based on the signature
        and transfer index.
        """
        if _is_schema_empty(self.native_transfers):
            return _empty_financial_lf()

        nt_df = self.native_transfers.with_columns(
            pl.cum_count("signature").alias("transfer_index")
        )
        idx_lower = self.index_address.lower()

        nt_filtered = nt_df.filter(
            (pl.col("fromUserAccount").str.to_lowercase() == idx_lower)
            | (pl.col("toUserAccount").str.to_lowercase() == idx_lower)
        )

        nt_filtered = _add_slot(nt_filtered, self.transactions)

        parsed_native = nt_filtered.select(
            [
                pl.struct(
                    ["signature", "fromUserAccount", "toUserAccount", "amount", "transfer_index"]
                )
                .map_elements(lambda s: generate_hash(self.index_address, s, "-2"), return_dtype=pl.String)
                .alias("transaction_id"),

                (pl.col("tx_index_in_slot").cast(pl.String) + "." + pl.col("transfer_index").cast(pl.String))
                .alias("abstracted_index"),

                pl.col("signature").alias("hash"),
                pl.col("slot").alias("block_number"),
                pl.col("fromUserAccount").alias("from"),
                pl.col("toUserAccount").alias("to"),
                pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                (pl.col("amount") / (10 ** self.NATIVE_DECIMALS)).cast(pl.String).alias("amount"),
                pl.lit(0).cast(pl.Float64).alias("fee"),
                pl.lit(self.NATIVE_DECIMALS).cast(pl.Int64).alias("decimals"),
                pl.when(pl.col("fromUserAccount").str.to_lowercase() == idx_lower)
                .then(pl.lit("OUT"))
                .otherwise(pl.lit("IN"))
                .alias("kind"),
                pl.lit(FinancialTransactionEventType.TRANSFER.value).alias("type"),
                pl.lit(self.SOL).alias("address"),
            ]
        ).unique(subset=["hash", "abstracted_index", "from", "to", "amount"])

        return parsed_native.select(list(FIN_SCHEMA.keys())).lazy()

    def get_parsed_token_transfers_transactions(self) -> pl.LazyFrame:
        """
        Parse SPL token transfers and normalize them into the standard financial schema.
        Joins with token metadata (symbol, decimals) when available.
        """
        if _is_schema_empty(self.token_transfers):
            return _empty_financial_lf()

        idx_addr_lower = self.index_address.lower()

        tt_df = self.token_transfers.with_columns(
            pl.cum_count("signature").alias("transfer_index")
        )

        tt_filtered = tt_df.filter(
            (pl.col("fromUserAccount").str.to_lowercase() == idx_addr_lower)
            | (pl.col("toUserAccount").str.to_lowercase() == idx_addr_lower)
        )

        tt_filtered = _add_slot(tt_filtered, self.transactions)

        # Token metadata join
        if _is_schema_empty(self.token_metadata) or not {"address"}.issubset(set(self.token_metadata.columns)):
            tt_filtered = tt_filtered.with_columns(
                pl.lit(None).alias("symbol"),
                pl.lit(None).cast(pl.Int64).alias("decimals"),
            )
        else:
            tt_filtered = tt_filtered.join(
                self.token_metadata.rename({"address": "mint"}),
                on="mint",
                how="left",
            )

        parsed_token = tt_filtered.select(
            [
                pl.struct(
                    ["signature", "fromUserAccount", "toUserAccount", "mint", "tokenAmount", "transfer_index"]
                )
                .map_elements(lambda s: generate_hash(self.index_address, s, "-3"), return_dtype=pl.String)
                .alias("transaction_id"),

                (pl.col("tx_index_in_slot").cast(pl.String) + "." + pl.col("transfer_index").cast(pl.String))
                .alias("abstracted_index"),

                pl.col("signature").alias("hash"),
                pl.col("slot").alias("block_number"),
                pl.col("fromUserAccount").alias("from"),
                pl.col("toUserAccount").alias("to"),

                pl.when(pl.col("symbol").is_not_null() & (pl.col("symbol") != ""))
                .then(pl.col("symbol"))
                .otherwise(pl.col("mint"))
                .alias("symbol"),

                pl.col("tokenAmount").cast(pl.String).alias("amount"),
                pl.lit(0).cast(pl.Float64).alias("fee"),
                pl.col("decimals").cast(pl.Int64).alias("decimals"),

                pl.when(pl.col("fromUserAccount").str.to_lowercase() == idx_addr_lower)
                .then(pl.lit("OUT"))
                .otherwise(pl.lit("IN"))
                .alias("kind"),

                pl.lit(FinancialTransactionEventType.TRANSFER.value).alias("type"),
                pl.col("mint").alias("address"),
            ]
        ).unique(subset=["hash", "abstracted_index", "from", "to", "amount", "address"])

        return parsed_token.select(list(FIN_SCHEMA.keys())).lazy()

    def get_parsed_transactions_fee(self) -> pl.LazyFrame:
        """
        Parse transaction fee events. Only include rows where the current index_address
        is the fee payer. These are recorded as separate "OUT" transactions with kind=FEE.
        """
        if _is_schema_empty(self.transactions):
            return _empty_financial_lf()

        to_slot = 0 if self.to_slot is None else self.to_slot
        if to_slot > 0:
            parsed_transactions = self.transactions.filter(pl.col("slot") <= self.to_slot)
        else:
            parsed_transactions = self.transactions

        parsed_transactions = parsed_transactions.select(
            [
                pl.struct("signature")
                .map_elements(lambda h: generate_hash(self.index_address, h, "-1"), return_dtype=pl.String)
                .alias("transaction_id"),

                (pl.col("tx_index_in_slot").cast(pl.String) + ".-1").alias("abstracted_index"),
                pl.col("signature").alias("hash"),
                pl.col("slot").alias("block_number"),
                pl.col("feePayer").alias("from"),
                pl.lit(None).cast(pl.String).alias("to"),
                pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                pl.lit(0).cast(pl.String).alias("amount"),

                pl.when(pl.col("feePayer").str.to_lowercase() == self.index_address.lower())
                .then(pl.col("fee") / (10 ** self.NATIVE_DECIMALS))
                .otherwise(pl.lit(0))
                .cast(pl.Float64)
                .alias("fee"),

                pl.lit(self.NATIVE_DECIMALS).cast(pl.Int64).alias("decimals"),

                pl.when(pl.col("feePayer").str.to_lowercase() == self.index_address.lower())
                .then(pl.lit("OUT"))
                .otherwise(pl.lit(None))
                .alias("kind"),

                pl.lit(FinancialTransactionEventType.FEE.value).alias("type"),
                pl.lit(self.SOL).alias("address"),
            ]
        ).filter(pl.col("fee") > 0)

        return parsed_transactions.select(list(FIN_SCHEMA.keys())).lazy()

    def filter_financial_transactions(
            self, financial_transactions: pl.DataFrame
    ) -> pl.DataFrame:
        """
        Filter financial transactions using token metadata.
        Currently, removes spam tokens.
        """
        if financial_transactions.is_empty():
            return financial_transactions  # avoid ColumnNotFoundError

        if "address" not in financial_transactions.columns:
            return financial_transactions

        tm_schema_names = set(self.token_metadata.collect_schema().names()) \
            if not _is_schema_empty(self.token_metadata) else set()
        if not {"address", "is_spam"}.issubset(tm_schema_names):
            return financial_transactions

        return (
            financial_transactions.lazy()
            .join(
                self.token_metadata.select(["address", "is_spam"]).filter(~pl.col("is_spam")),
                on="address",
                how="inner",
            )
            .drop("is_spam")
            .collect()
        )

    @staticmethod
    def get_financial_transactions_aggregate_stats(
        financial_transactions: pl.DataFrame,
    ) -> pl.DataFrame:
        """
        Compute aggregated financial stats by token, using DuckDB.
        Outgoing transactions are counted as negative amounts (amount + fee),
        while incoming transactions are positive.
        """
        duckdb_query = duckdb.sql("""
            SELECT index_address, symbol, address,
            (SUM(
                CASE WHEN kind = 'OUT' 
                     THEN -1 * (amount::uhugeint + fee::uhugeint)
                     ELSE amount::uhugeint 
                END
            ))::text as sum
            FROM financial_transactions 
            GROUP BY index_address, decimals, address, decimals, symbol
        """)
        duckdb_query.show(max_rows=3000)
        return duckdb_query.pl()
