from typing import List, Optional, Tuple, Union

import hypersync
import pyarrow as pa
from hypersync import (
    BlockField,
    DataType,
    HexOutput,
    LogField,
    TraceField,
    TransactionField,
)

from data_onchain_ingestor.config.config import (
    DEPOSIT_TOPIC,
    TRANSFER_TOPIC,
    WITHDRAWAL_TOPIC,
)
from data_onchain_ingestor.config.config import get_logger


class HyperSync:
    def __init__(self, endpoint: str = "http://eth.hypersync.xyz"):
        self.logger = get_logger(__name__)
        self.client = self.__get_client(endpoint)

    def __get_client(self, endpoint: str) -> hypersync.HypersyncClient:
        return hypersync.HypersyncClient(hypersync.ClientConfig(url=endpoint))

    def get_query(
        self,
        index_addresses: List[str],
        from_block: Optional[int] = None,
        to_block: Optional[int] = None,
        log_topics: List[str] = [TRANSFER_TOPIC, DEPOSIT_TOPIC, WITHDRAWAL_TOPIC],
    ) -> hypersync.Query:
        """
        Get a query object for the HyperSync client. Reason to separate to Query is to control how we want to execute
        :param indexed_addresses: Addresses to filter by
        :param from_block: From block number
        :param to_block: To block number - NOT IN USE AT THIS VERSION
        :param log_topic: Topic to filter logs - default is TRANSFER topic
        :return: HyperSync query object
        """

        def __address_to_topic(address: str) -> str:
            return "0x000000000000000000000000" + address[2:]

        if not from_block:
            from_block = 0

        addresses_topics = list(map(__address_to_topic, index_addresses))

        log_selections = []
        if TRANSFER_TOPIC in log_topics:
            log_selections.append(
                hypersync.LogSelection(
                    topics=[[TRANSFER_TOPIC], [], addresses_topics, []]
                )
            )
            log_selections.append(
                hypersync.LogSelection(
                    topics=[[TRANSFER_TOPIC], addresses_topics, [], []]
                )
            )
        if DEPOSIT_TOPIC in log_topics:
            log_selections.append(
                hypersync.LogSelection(
                    topics=[[DEPOSIT_TOPIC], addresses_topics, [], []]
                )
            )
        if WITHDRAWAL_TOPIC in log_topics:
            log_selections.append(
                hypersync.LogSelection(
                    topics=[[WITHDRAWAL_TOPIC], addresses_topics, [], []]
                )
            )

        return hypersync.Query(
            join_mode=hypersync.JoinMode.JOIN_ALL,
            from_block=from_block,
            # from_block=13536559,
            to_block=to_block,
            logs=log_selections,
            blocks=[
              hypersync.BlockSelection(miner=index_addresses)
            ],
            transactions=[
                hypersync.TransactionSelection(from_=index_addresses),
                hypersync.TransactionSelection(to=index_addresses),
            ],
            traces=[
                hypersync.TraceSelection(from_=index_addresses),
                hypersync.TraceSelection(to=index_addresses),
            ],
            field_selection=hypersync.FieldSelection(
                block=[
                    BlockField.NUMBER,
                    BlockField.PARENT_HASH,
                    BlockField.TIMESTAMP,
                    BlockField.HASH,
                    BlockField.BASE_FEE_PER_GAS,
                    BlockField.GAS_LIMIT,
                    BlockField.GAS_USED,
                    BlockField.BLOB_GAS_USED,
                    BlockField.EXCESS_BLOB_GAS,
                    BlockField.MINER,
                    BlockField.NONCE,
                    BlockField.UNCLES,
                ],
                log=[
                    LogField.BLOCK_NUMBER,
                    LogField.LOG_INDEX,
                    LogField.TRANSACTION_INDEX,
                    LogField.TRANSACTION_HASH,
                    LogField.DATA,
                    LogField.ADDRESS,
                    LogField.TOPIC0,
                    LogField.TOPIC1,
                    LogField.TOPIC2,
                    LogField.TOPIC3,
                    LogField.REMOVED,
                ],
                transaction=[
                    TransactionField.HASH,
                    TransactionField.TRANSACTION_INDEX,
                    TransactionField.BLOCK_NUMBER,
                    TransactionField.FROM,
                    TransactionField.TO,
                    TransactionField.VALUE,
                    TransactionField.GAS,
                    TransactionField.GAS_PRICE,
                    TransactionField.GAS_USED,
                    TransactionField.CUMULATIVE_GAS_USED,
                    TransactionField.EFFECTIVE_GAS_PRICE,
                    TransactionField.CONTRACT_ADDRESS,
                    TransactionField.MAX_FEE_PER_GAS,
                    TransactionField.MAX_PRIORITY_FEE_PER_GAS,
                    TransactionField.NONCE,
                    TransactionField.STATUS,
                    TransactionField.INPUT,
                ],
                trace=[
                    TraceField.BLOCK_NUMBER,
                    TraceField.TRANSACTION_HASH,
                    TraceField.TRANSACTION_POSITION,
                    TraceField.CALL_TYPE,
                    TraceField.GAS,
                    TraceField.GAS_USED,
                    TraceField.INPUT,
                    TraceField.FROM,
                    TraceField.TO,
                    TraceField.VALUE,
                    TraceField.INPUT,
                    TraceField.OUTPUT,
                    TraceField.ADDRESS,
                    TraceField.CODE,
                    TraceField.SUBTRACES,
                    TraceField.TRACE_ADDRESS,
                    TraceField.TYPE,
                    TraceField.ERROR,
                    TraceField.REWARD_TYPE,
                    TraceField.AUTHOR,
                ],
            ),
        )

    def get_stream_config(self) -> hypersync.StreamConfig:
        """
        Get the stream config for the HyperSync client - use for format data when receiving
        :return: HyperSync stream config object
        """
        return hypersync.StreamConfig(
            hex_output=HexOutput.PREFIXED,
            column_mapping=hypersync.ColumnMapping(
                block={
                    BlockField.TIMESTAMP: DataType.UINT32,
                    BlockField.BASE_FEE_PER_GAS: DataType.UINT64,
                    BlockField.GAS_LIMIT: DataType.UINT64,
                    BlockField.GAS_USED: DataType.UINT64,
                    BlockField.BLOB_GAS_USED: DataType.UINT64,
                    BlockField.EXCESS_BLOB_GAS: DataType.UINT64,
                },
                transaction={
                    TransactionField.TRANSACTION_INDEX: DataType.INT32,
                    TransactionField.GAS: DataType.UINT64,
                    TransactionField.GAS_PRICE: DataType.UINT64,
                    TransactionField.GAS_USED: DataType.UINT64,
                    TransactionField.CUMULATIVE_GAS_USED: DataType.UINT64,
                    TransactionField.EFFECTIVE_GAS_PRICE: DataType.UINT64,
                    TransactionField.MAX_FEE_PER_GAS: DataType.UINT64,
                    TransactionField.MAX_PRIORITY_FEE_PER_GAS: DataType.UINT64,
                    TransactionField.NONCE: DataType.UINT64,
                },
                log={
                    LogField.LOG_INDEX: DataType.INT32,
                    LogField.TRANSACTION_INDEX: DataType.INT32,
                },
                trace={
                    TraceField.GAS: DataType.UINT64,
                    TraceField.GAS_USED: DataType.UINT64,
                    TraceField.TRANSACTION_POSITION: DataType.INT32,
                },
            ),
        )

    async def execute_query(
        self, query: hypersync.Query, index_address: str
    ) -> Tuple[
        Union[pa.Table, None],
        Union[pa.Table, None],
        Union[pa.Table, None],
        Union[pa.Table, None],
        int,
    ]:
        """
        Execute the query with the HyperSync client
        :param query: Query object
        :param event_signature: to decode the logs
        :return: PyArrow tables of blocks, transactions, logs, decoded logs, traces
        """
        self.logger.info("Executing query ...")
        result = await self.client.collect_arrow(query, self.get_stream_config())
        self.logger.info(f"Query executed. Next block to query: {result.next_block}")

        if not result.data.blocks:
            return None, None, None, None, result.next_block

        if result.data.transactions:
            preprocess_transactions = self.__preprocess_transactions(
                result.data.transactions
            )
        else:
            preprocess_transactions = None

        if result.data.traces:
            preprocess_traces = self.__preprocess_traces(result.data.traces)
        else:
            preprocess_traces = None

        return (
            self.__add_index_address(result.data.blocks, index_address),
            self.__add_index_address(preprocess_transactions, index_address),
            self.__add_index_address(result.data.logs, index_address),
            self.__add_index_address(preprocess_traces, index_address),
            result.next_block,
        )

    def __preprocess_transactions(self, transactions: pa.Table) -> pa.Table:
        """
        Preprocess transactions by converting hex values to decimal
        :param transactions: PyArrow table of transactions
        :return: PyArrow table of transactions
        """
        value = transactions.column("value")
        decimal_values_column = pa.array(
            [
                str(int(hex_val.as_py(), 16)) if hex_val.as_py() else hex_val.as_py()
                for hex_val in value
            ]
        )

        updated_arrow_table = transactions.set_column(
            transactions.schema.get_field_index("value"), "value", decimal_values_column
        )
        return updated_arrow_table

    def __preprocess_traces(self, traces: pa.Table) -> pa.Table:
        """
        Preprocess traces by converting hex values to decimal and adding trace_index
        :param traces: PyArrow table of traces
        :return: PyArrow table of traces
        """
        value = traces.column("value")
        decimal_values_column = pa.array(
            [
                str(int(hex_val.as_py(), 16)) if hex_val.as_py() else hex_val.as_py()
                for hex_val in value
            ]
        )

        current_hash = None
        counter_index = 0
        trace_index = []
        for transaction_hash in traces.column("transaction_hash"):
            if transaction_hash.as_py() != current_hash:
                current_hash = transaction_hash.as_py()
                counter_index = 0
            trace_index.append(counter_index)
            counter_index += 1

        trace_index_column = pa.array(trace_index)

        updated_arrow_table = traces.set_column(
            traces.schema.get_field_index("value"), "value", decimal_values_column
        ).append_column("trace_index", trace_index_column)

        return updated_arrow_table

    def __add_index_address(self, data: pa.Table, index_address: str) -> pa.Table:
        num_rows = data.num_rows
        index_column = pa.array([index_address] * num_rows)
        return data.append_column("index_address", index_column)
