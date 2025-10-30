from typing import List, Optional, Union

import duckdb
import polars as pl
import pyarrow as pa
from polars import Expr

from data_onchain_ingestor.core.utility.block_search import (
    BlockSearch,
)

from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.utility.abi_decoder import parse_log_by_event
from data_onchain_ingestor.core.utility.hash import generate_hash
from data_onchain_ingestor.dto.financial_transaction_event_type import (
    FinancialTransactionEventType,
)


class EthereumParser:
    NATIVE_SYMBOL = "ETH"
    NATIVE_CONTRACT_ADDRESS = "ethereum"
    NATIVE_DECIMALS = 18

    BYZANTINUM = 4_370_000
    CONSTANTINOPLE = 7_280_000
    MERGE = 15_537_394

    ONE_ETH = 10**NATIVE_DECIMALS
    FIVE_ETH = 5 * ONE_ETH
    THREE_ETH = 3 * ONE_ETH
    TWO_ETH = 2 * ONE_ETH

    UNCLES_ABSTRACTED_INDEX = 1

    def __init__(
        self,
        index_address: str,
        blocks: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        transactions: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        logs: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        traces: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        token_metadata: Union[pl.DataFrame, pl.LazyFrame],
        uncles: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        withdrawals: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
        to_block: Optional[int] = None,
        debug_mode: bool = False,
    ):
        """
        Init Ethereum Parser - provide data and configurations to parse the data
        :param index_address: Address to be indexed
        :param blocks:
        :param transactions:
        :param logs:
        :param traces:
        :param token_metadata: fetched metadata
        :param to_block: Optional to_block to filter the data
        :param debug_mode: With debug mode, the data will be written to CSV files in local system
        """
        self.index_address = index_address
        self.to_block = to_block
        self.blocks = self.__convert_to_frame(blocks)
        self.transactions = self.__convert_to_frame(transactions)
        self.logs = self.__convert_to_frame(logs)
        self.traces = self.__convert_to_frame(traces)
        self.token_metadata = self.__convert_to_frame(token_metadata)
        self.uncles = self.__convert_to_frame(uncles)
        self.withdrawals = self.__convert_to_frame(withdrawals)

        self.finance_transactions = None
        self.debug_mode = debug_mode
        self.standard_schema = None
        self.logger = get_logger(__name__)

    @staticmethod
    def __convert_to_frame(
        data: Union[pa.Table, str, pl.DataFrame, pl.LazyFrame],
    ) -> pl.LazyFrame:
        if data is None:
            return pl.LazyFrame()
        if isinstance(data, pa.Table):
            return pl.from_arrow(data).lazy()
        elif isinstance(data, str):
            return pl.scan_delta(data)
        elif isinstance(data, pl.DataFrame):
            return data.lazy()
        df: pl.LazyFrame = data
        return df

    def get_financial_transactions(
        self,
        sort_by: Optional[List[str]] = ["timestamp"],
        balances_df: Optional[Union[pa.Table, str, pl.DataFrame, pl.LazyFrame]] = None,
        accepted_deviation_percent: Optional[float] = 0,
    ) -> pl.DataFrame:
        """
        Get financial transactions by parsing transactions, traces and logs
        :param sort_by: Optional sort by columns - default descending by timestamp
        :param balances_df: Optional balances DataFrame to calculate the deviation
        :param accepted_deviation_percent: Optional accepted deviation for balance calculation - only used when balances_df is provided
        :return: Financial transactions
        """
        if self.finance_transactions is not None:
            return self.finance_transactions

        parsed_transactions_fee = self.get_parsed_transactions_fee()
        standard_columns = parsed_transactions_fee.columns
        self.standard_schema = parsed_transactions_fee.schema

        parsed_traces = self.get_parsed_traces().select(standard_columns)
        parsed_logs = self.get_parsed_logs().select(standard_columns)
        parsed_uncles = self.get_parsed_uncles().select(standard_columns)
        parsed_withdrawals = self.get_parsed_withdrawals().select(standard_columns)

        if self.debug_mode:
            self.debug_parser_logs_by_token(parsed_logs)
        financial_transactions = (
            pl.concat(
                [
                    parsed_transactions_fee,
                    parsed_traces,
                    parsed_logs,
                    parsed_uncles,
                    parsed_withdrawals,
                ],
                how="diagonal",
                rechunk=True,
            )
            .join(
                self.blocks.select(
                    [pl.col("number").alias("block_number"), "timestamp"]
                ),
                on="block_number",
                how="inner",
            )
            .with_columns(
                [
                    pl.lit(self.index_address).alias("index_address"),
                    pl.lit(Chain.ETHEREUM.value).alias("blockchain_id"),
                    pl.col("from").alias("from_address"),
                    pl.col("to").alias("to_address"),
                    pl.col("fee").cast(pl.String),
                    pl.col("decimals").cast(pl.Int8),
                    pl.col("block_number").cast(pl.UInt32),
                    pl.col("timestamp").cast(pl.UInt32),
                ]
            )
            .drop(["from", "to"])
        ).collect()

        if financial_transactions.is_empty():
            self.logger.warning("No financial transactions found, data is empty")
            return pl.DataFrame()

        if sort_by:
            financial_transactions = financial_transactions.sort(
                sort_by, descending=True
            )

        if balances_df is not None:
            # use Inner instead of Leff join because we might not get all balances
            # Only support native symbol
            # Can't use native polars aggregation because Polars not support uint256 while DuckDB supporting it
            duckdb.sql(
                f"""
                CREATE TABLE duckdb_transactions AS
                SELECT block_number,
                SUM(CASE WHEN kind = 'OUT' THEN - amount::hugeint - fee::hugeint ELSE amount::hugeint END) as calculated_balance
                FROM financial_transactions WHERE symbol = '{self.NATIVE_SYMBOL}' GROUP BY block_number
                """
            )
            duckdb.sql(
                f"""
                CREATE TABLE duckdb_block_deviation AS
                SELECT duckdb_transactions.block_number,
                SUM(calculated_balance) OVER (ORDER BY duckdb_transactions.block_number) as rolling_balance, balance::uhugeint as ubalance,
                abs(rolling_balance - ubalance) / ubalance * 100 as deviation,
                deviation <= {accepted_deviation_percent} as is_accepted
                FROM duckdb_transactions
                INNER JOIN balances_df ON duckdb_transactions.block_number = balances_df.block_number
                """
            )
            duckdb.sql(
                """
                SELECT * FROM duckdb_block_deviation WHERE is_accepted = false order by block_number
                """
            ).show()

        self.finance_transactions = financial_transactions
        return financial_transactions

    def filter_financial_transactions(
        self, financial_transactions: pl.DataFrame
    ) -> pl.DataFrame:
        """
        Filter financial transactions by set of rules.
        Only filter spam currently.
        :param financial_transactions: Financial transactions DataFrame
        :return: Filtered financial transactions
        """
        filtered_financial_transactions = (
            financial_transactions.lazy()
            .join(
                self.token_metadata.select(["address", "is_spam"]).filter(
                    ~pl.col("is_spam")
                ),
                on="address",
                how="inner",
            )
            .drop("is_spam")
            .collect()
        )
        return filtered_financial_transactions

    def get_parsed_transactions_fee(self) -> pl.LazyFrame:
        """
        Parse transactions and return fee of transaction only since the balance is calculated in the traces
        :return: Transactions with fee only
        """
        if self.to_block:
            parsed_transactions = self.transactions.filter(
                pl.col("block_number") <= self.to_block
            )
        else:
            parsed_transactions = self.transactions

        parsed_transactions = parsed_transactions.select(
            [
                pl.struct("hash")
                .map_elements(
                    lambda h: generate_hash(self.index_address, h, "-1"),
                    return_dtype=pl.String,
                )
                .alias("transaction_id"),
                (pl.col("transaction_index").cast(pl.String) + ".-1").alias(
                    "abstracted_index"
                ),
                "hash",
                "block_number",
                "from",
                pl.lit(None).cast(pl.String).alias("to"),
                pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                pl.lit(0).alias("amount").cast(pl.String),
                pl.when(pl.col("from").str.to_lowercase() == self.index_address.lower())
                .then(pl.col("gas_price") * pl.col("gas_used"))
                .otherwise(pl.lit(0))
                .cast(pl.UInt64)
                .alias("fee"),
                pl.lit(self.NATIVE_DECIMALS).alias("decimals").cast(pl.Int64),
                pl.when(pl.col("from").str.to_lowercase() == self.index_address.lower())
                .then(pl.lit("OUT"))
                .otherwise(pl.lit("IN"))
                .alias("kind"),
                pl.lit(FinancialTransactionEventType.FEE.value).alias("type"),
                pl.lit(self.NATIVE_CONTRACT_ADDRESS).alias("address"),
            ]
        ).filter(pl.col("fee") > 0)

        return parsed_transactions

    def get_parsed_traces(self) -> pl.LazyFrame:
        """
        Parse traces and return the financial transactions
        - Filter out the errors, and index_address in from or to
        :return:
        """
        # create blocks with base rewards and uncle inclusive rewards
        blocks_with_rewards = self.blocks.with_columns(
            self.__get_base_reward(pl.col("number")).alias("base_reward"),
        ).with_columns(
            (
                pl.when(pl.col("uncles").is_null())
                .then(pl.lit(0))
                .otherwise(
                    (
                        pl.when(pl.col("uncles").str.lengths() > 66)
                        .then(pl.col("base_reward").mul(2) / 32)
                        .otherwise(pl.col("base_reward") / 32)
                    )
                )
            ).alias("inclusive_reward")
        )

        # create transactions with fee and burnt_fee
        total_tx_with_fee = (
            self.transactions.join(
                self.blocks, left_on="block_number", right_on="number"
            )
            .with_columns(
                [
                    pl.col("effective_gas_price")
                    .mul(pl.col("gas_used"))
                    .alias("total_tx_fee"),
                    (
                        pl.when(pl.col("base_fee_per_gas").is_null())
                        .then(pl.lit(0))
                        .otherwise(pl.col("gas_used").mul(pl.col("base_fee_per_gas")))
                    ).alias("burnt_fee"),
                ]
            )
            .groupby(["block_number"])
            .agg([pl.col("total_tx_fee").sum(), pl.col("burnt_fee").sum()])
        )

        # join total_tx_with_fee and blocks_with_rewards
        blocks_with_rewards_and_tx_fees = blocks_with_rewards.join(
            total_tx_with_fee, left_on="number", right_on="block_number"
        ).select(
            ["number", "total_tx_fee", "burnt_fee", "base_reward", "inclusive_reward"]
        )

        parsed_traces = (
            self.traces.join(
                self.transactions.select(["hash", "status"]),
                left_on="transaction_hash",
                right_on="hash",
                how="left",
            )
            .filter(pl.col("error").is_null())
            .filter(
                pl.when(pl.col("reward_type").is_null())
                .then(
                    (
                        (
                            pl.col("from").str.to_lowercase()
                            == self.index_address.lower()
                        )
                        | (
                            pl.col("to").str.to_lowercase()
                            == self.index_address.lower()
                        )
                    )
                    & (pl.col("status") == 1)
                )
                .otherwise(
                    (pl.col("reward_type") == "block")
                    & (
                        pl.col("author").str.to_lowercase()
                        == self.index_address.lower()
                    )
                )
            )
            .filter(pl.col("value") != "0")
        )

        if self.to_block:
            parsed_traces = parsed_traces.filter(
                pl.col("block_number") <= self.to_block
            )

        parsed_traces = (
            parsed_traces.join(
                blocks_with_rewards_and_tx_fees,
                left_on="block_number",
                right_on="number",
            )
            .with_columns(
                [
                    (
                        pl.col("base_reward")
                        .add(pl.col("total_tx_fee"))
                        .add(pl.col("inclusive_reward"))
                        .sub(pl.col("burnt_fee"))
                    ).alias("reward"),
                    (
                        pl.when(pl.col("reward_type").is_null())
                        .then(
                            pl.struct(
                                [
                                    "transaction_hash",
                                    "transaction_position",
                                    "trace_index",
                                ]
                            ).map_elements(
                                lambda h: generate_hash(
                                    self.index_address,
                                    h["transaction_hash"],
                                    h["transaction_position"],
                                    h["trace_index"],
                                    "trace",
                                ),
                                return_dtype=pl.String,
                            )
                        )
                        .otherwise(
                            pl.struct(["block_number", "author"]).map_elements(
                                lambda h: generate_hash(
                                    self.index_address,
                                    h["block_number"],
                                    "miner",
                                    "trace",
                                ),
                                return_dtype=pl.String,
                            )
                        )
                    ).alias("transaction_id"),
                    (
                        pl.when(pl.col("reward_type").is_null())
                        .then(
                            pl.col("transaction_position").cast(pl.String)
                            + "."
                            + pl.col("trace_index").cast(pl.String)
                        )
                        .otherwise(pl.lit("0"))
                    ).alias("abstracted_index"),
                ]
            )
            .select(
                [
                    "transaction_id",
                    "abstracted_index",
                    pl.col("transaction_hash").alias("hash"),
                    "block_number",
                    pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                    pl.lit(self.NATIVE_DECIMALS).alias("decimals").cast(pl.Int64),
                    pl.when(
                        pl.col("from").str.to_lowercase() == self.index_address.lower()
                    )
                    .then(pl.lit("OUT"))
                    .otherwise(pl.lit("IN"))
                    .alias("kind"),
                    pl.lit(0).cast(pl.UInt64).alias("fee"),
                    pl.when(pl.col("reward_type").is_null())
                    .then(pl.col("value"))
                    .otherwise(pl.col("reward"))
                    .alias("amount"),
                    pl.lit(self.NATIVE_CONTRACT_ADDRESS).alias("address"),
                    "from",
                    pl.when(pl.col("reward_type").is_null())
                    .then(pl.col("to"))
                    .otherwise(pl.col("author"))
                    .alias("to"),
                    pl.when(~pl.col("reward_type").is_null())
                    .then(pl.lit(FinancialTransactionEventType.REWARD.value))
                    .otherwise(
                        pl.when(pl.col("trace_index") == 0)
                        .then(pl.lit(FinancialTransactionEventType.TRANSFER.value))
                        .otherwise(
                            pl.lit(
                                FinancialTransactionEventType.INTERNAL_TRANSFER.value
                            )
                        )
                    )
                    .alias("type"),
                ]
            )
        )
        return parsed_traces

    def get_parsed_logs(self) -> pl.LazyFrame:
        logs = self.logs.select(
            [
                "transaction_hash",
                "log_index",
                "block_number",
                "transaction_index",
                "address",
                "topic0",
                "topic1",
                "topic2",
                "topic3",
                "data",
                pl.struct(["topic0", "topic1", "topic2", "topic3", "data"])
                .map_elements(
                    lambda h: parse_log_by_event(
                        [h["topic0"], h["topic1"], h["topic2"], h["topic3"]], h["data"]
                    ),
                    return_dtype=pl.Struct,
                )
                .alias("topic_struct"),
            ]
        )

        logs = (
            logs.unnest("topic_struct")
                .collect()
                .filter(pl.col("from").is_not_null() & pl.col("to").is_not_null())
        )
        # if logs is empty return empty frame
        if logs.is_empty():
            return pl.DataFrame(schema=self.standard_schema).lazy()

        logs = (
            logs.drop(["topic0", "topic1", "topic2", "topic3", "data"])
            .filter(
                (pl.col("from").str.to_lowercase() == self.index_address.lower())
                | (pl.col("to").str.to_lowercase() == self.index_address.lower())
            )
            .lazy()
        )

        enriched_logs = (
            logs.join(self.token_metadata, on="address", how="inner")
            .with_columns(
                pl.when(pl.col("from").str.to_lowercase() == self.index_address.lower())
                .then(pl.lit("OUT"))
                .otherwise(pl.lit("IN"))
                .alias("kind"),
                (
                    pl.col("transaction_index").cast(pl.String)
                    + "."
                    + pl.col("log_index").cast(pl.String)
                ).alias("abstracted_index"),
                pl.struct(["transaction_hash", "transaction_index", "log_index"])
                .map_elements(
                    lambda h: generate_hash(
                        self.index_address,
                        h["transaction_hash"],
                        h["transaction_index"],
                        h["log_index"],
                        "log",
                    ),
                    return_dtype=pl.String,
                )
                .alias("transaction_id"),
                pl.col("transaction_hash").alias("hash"),
                pl.lit(0).cast(pl.UInt64).alias("fee"),
            )
            .drop(
                [
                    "log_index",
                    "transaction_hash",
                    "transaction_index",
                    "is_spam",
                    "extra",
                    "owner",
                    "image_url",
                    "description",
                    "name",
                ]
            )
        )
        return enriched_logs

    def get_parsed_uncles(self) -> pl.LazyFrame:
        if self.uncles.collect().is_empty():
            return pl.DataFrame(schema=self.standard_schema).lazy()

        return self.uncles.with_columns(
            [
                self.__get_base_reward(pl.col("block_number")).alias("base_reward"),
            ]
        ).select(
            [
                pl.lit(self.UNCLES_ABSTRACTED_INDEX).cast(pl.String).alias("abstracted_index"),
                pl.col("block_hash").alias("hash"),
                pl.col("block_number").cast(pl.UInt64).alias("block_number"),
                pl.struct(
                    ["block_number", "uncle_block_number", "uncle_miner"]
                ).map_elements(
                    lambda h: generate_hash(
                        h["block_number"],
                        h["uncle_block_number"],
                        h["uncle_miner"],
                        "uncles",
                    ),
                    return_dtype=pl.String,
                ).alias("transaction_id"),
                pl.lit(None).cast(pl.String).alias("from"),
                pl.col("uncle_miner").alias("to"),
                pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                pl.struct(["base_reward", "block_number", "uncle_block_number"]).map_elements(
                    lambda h: ((h["uncle_block_number"] + 8 - h["block_number"]) * h["base_reward"]) >> 3,
                    return_dtype=pl.UInt64
                ).cast(pl.String).alias("amount"),
                pl.lit(0).cast(pl.UInt64).alias("fee"),
                pl.lit(self.NATIVE_DECIMALS).cast(pl.Int64).alias("decimals"),
                pl.lit("IN").alias("kind"),
                pl.lit(FinancialTransactionEventType.UNCLE_REWARD.value).alias("type"),
                pl.lit(self.NATIVE_CONTRACT_ADDRESS).alias("address"),
            ]
        )

    def get_parsed_withdrawals(self) -> pl.LazyFrame:
        if self.withdrawals.collect().is_empty():
            return pl.DataFrame(schema=self.standard_schema).lazy()

        return self.withdrawals.select(
            [
                pl.col("index").cast(pl.String).alias("abstracted_index"),
                pl.col("block_hash").alias("hash"),
                pl.struct(["block_number", "address", "index"]).map_elements(
                    lambda h: generate_hash(
                        h["block_number"],
                        h["address"],
                        h["index"],
                        "withdrawals",
                    ),
                    return_dtype=pl.String,
                ).alias("transaction_id"),
                pl.col("block_number").cast(pl.UInt64).alias("block_number"),
                pl.lit(None).cast(pl.String).alias("from"),
                pl.col("address").alias("to"),
                pl.lit(self.NATIVE_SYMBOL).alias("symbol"),
                pl.col("amount").cast(pl.String).alias("amount"),
                pl.lit(0).cast(pl.UInt64).alias("fee"),
                pl.lit(self.NATIVE_DECIMALS).cast(pl.Int64).alias("decimals"),
                pl.lit("IN").alias("kind"),
                pl.lit(FinancialTransactionEventType.POS_WITHDRAWALS.value).alias("type"),
                pl.lit(self.NATIVE_CONTRACT_ADDRESS).alias("address"),
            ]
        )

    def debug_parser_logs_by_token(
        self,
        parsed_logs: pl.LazyFrame,
        token_address: str = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    ) -> pl.DataFrame:
        transform_logs = parsed_logs.filter(pl.col("address") == token_address)  # noqa: F841

        # use Inner instead of Leff join because we might not get all balances
        # Only support native symbol
        # Can't use native polars aggregation because Polars not support uint256 while DuckDB supporting it
        decimals = (
            self.token_metadata.collect()
            .filter(pl.col("address") == token_address)
            .get_column("decimals")
            .to_list()[0]
        )

        duckdb.sql(
            f"""
            CREATE TABLE duckdb_block_token AS
            SELECT block_number, hash,
            SUM(CASE WHEN kind = 'OUT' THEN - amount::hugeint - fee::hugeint ELSE amount::hugeint END / pow(10, {decimals}))
            OVER (ORDER BY block_number) as balance
            FROM transform_logs
            """
        )

        token_df = duckdb.sql(
            """
            SELECT block_number, balance  FROM duckdb_block_token order by block_number
            """
        ).pl()

        divergent_block_number = BlockSearch(
            address=self.index_address,
            internal_data=token_df,
            erc20_address=token_address,
            decimals=decimals,
        ).find_divergent_block()

        self.logger.debug(f"First divergent block: {divergent_block_number}")

    @staticmethod
    def handle_logs_proxies(data: pl.LazyFrame) -> pl.LazyFrame:
        """
        Scan logs and identify potential proxies (nodes that receive and then send), map them to the actual sender and receiver
        Data is in LazyFrame for lazy evaluation, all will be converted to DataFrame in middle if needed
        Implementation:
            - Join the data with itself on TX_ID and FROM columns and get proxy transactions
            - Identify proxies - need to be collected (eager load) because of the join
            - Handle proxy transactions by select correct receiver - sender is correct by default because of above join
            - Select non-proxy transactions by filtering out the proxies
            - Concatenate the handled proxy transactions and non-proxy transactions
        :param data: Polars LazyFrame
        :return: handled DataFrame with correct mapping of sender and receiver
        """
        if isinstance(data, pa.Table):
            data = pl.DataFrame(data).lazy()
        elif isinstance(data, str):
            data = pl.scan_delta(data)

        proxy_transactions = data.join(
            data,
            left_on=["transaction_hash", "to"],
            right_on=["transaction_hash", "from"],
            how="inner",
            suffix="_actual",
        )
        proxies = proxy_transactions.select(["to"]).unique().collect()

        handled_proxy_transactions = proxy_transactions.select(
            [
                pl.col("log_index_actual").alias("log_index"),
                "transaction_hash",
                "block_number",
                "transaction_index",
                "type",
                "address",
                "from",
                pl.col("to_actual").alias("to"),
                pl.col("amount_actual").alias("amount"),
            ]
        )

        non_proxies_transactions = data.filter(
            ~pl.col("from").is_in(proxies) & ~pl.col("to").is_in(proxies)
        ).select(
            [
                "log_index",
                "transaction_hash",
                "block_number",
                "transaction_index",
                "type",
                "address",
                "from",
                "to",
                "amount",
            ]
        )

        final_transactions: pl.LazyFrame = pl.concat(
            [handled_proxy_transactions, non_proxies_transactions], rechunk=True
        ).sort(["transaction_hash", "log_index"])
        return final_transactions

    @staticmethod
    def get_financial_transactions_aggregate_stats(
        financial_transactions: pl.DataFrame,
    ) -> pl.DataFrame:
        """
        Get aggregate statistics for financial transactions
        :param financial_transactions: Polars DataFrame
        :return: None
        """
        duckdb_query = duckdb.sql("""
            SELECT index_address, symbol, address,
            (SUM(CASE WHEN kind = 'OUT' THEN -1 * (amount::uhugeint + fee::uhugeint) ELSE amount::uhugeint END) / POW(10, decimals))::text as sum
            FROM financial_transactions GROUP BY index_address, decimals, address, decimals, symbol
        """)
        duckdb_query.show(max_rows=1000)
        return duckdb_query.pl()

    def __get_base_reward(self, col: pl.col) -> Expr:
        return (
            pl.when(col < self.BYZANTINUM)
            .then(pl.lit(self.FIVE_ETH))
            .otherwise(
                (
                    pl.when((col >= self.BYZANTINUM) & (col < self.CONSTANTINOPLE))
                    .then(pl.lit(self.THREE_ETH))
                    .otherwise(
                        pl.when((col >= self.CONSTANTINOPLE) & (col < self.MERGE))
                        .then(pl.lit(self.TWO_ETH))
                        .otherwise(0)
                    )
                )
            )
        )
