import asyncio
import duckdb
import pytest
import pyarrow as pa
import boto3

from data_onchain_ingestor.chains.providers import HyperSync
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from botocore.exceptions import ClientError


@pytest.fixture
def s3_client():
    # Configure boto3 to use LocalStack's endpoint for S3
    return boto3.client(
        "s3",
        endpoint_url="http://localhost:4566",
        aws_access_key_id="test",
        aws_secret_access_key="test",
        region_name="ap-southeast-1",
    )


@pytest.fixture
def lakehouse_instance():
    return LakeHouse(base_storage_uri="s3://localhost:4566/evm2")


def test_write_append(s3_client, lakehouse_instance):
    # Mocking data
    mock_data = pa.Table.from_pydict({"col1": [1, 2, 3]})

    # Perform write operation
    lakehouse_instance.write(
        data=mock_data, name="test_table", unique_keys=["col1"], mode="append"
    )

    # Check if object exists in S3 bucket
    try:
        response = s3_client.head_object(
            Bucket="evm2", Key="test_table/part-00000-UUID.parquet"
        )
    except ClientError as e:
        assert False, f"Object does not exist in S3 bucket: {e}"


def test_write_merge(s3_client, lakehouse_instance):
    # Mocking data
    mock_data = pa.Table.from_pydict({"col1": [1, 2, 3]})

    # Perform write operation
    lakehouse_instance.write(
        data=mock_data, name="test_table", unique_keys=["col1"], mode="merge"
    )

    # Check if object exists in S3 bucket
    try:
        response = s3_client.head_object(
            Bucket="evm2", Key="test_table/part-00000-UUID.parquet"
        )
    except ClientError as e:
        assert False, f"Object does not exist in S3 bucket: {e}"


def test_read():
    # indexed_address = "0x77016474b3fff23611cb827efbadaea44f10637c"
    # # df = DeltaTable("s3://dp-dev-temporal-data/evm2/blocks").to_pyarrow_table(filters=[
    # #     (("block_number", "<=", 15000000) | ("from", "==", indexed_address)),
    # #
    # #             <= 15000000
    # #             & (
    # #                     (pl.col("from").str.to_lowercase() == indexed_address.lower())
    # #                     | (pl.col("to").str.to_lowercase() == indexed_address.lower())
    # #             )
    # #     )
    # # ])
    #
    # # dt = pl.from_arrow(df).lazy()
    # # duckdb.sql("select * from dt").show()
    # # indexed_address = "0x77016474b3fff23611cb827efbadaea44f10637c"
    # # address_topic = "0x000000000000000000000000" + indexed_address[2:]
    # lakehouse = LakeHouse(base_storage_uri="s3://dp-dev-temporal-data/kien/")
    # dt = (
    #     lakehouse.read("traces")
    #     .filter(
    #         (pl.col("block_number") <= 15000000)
    #         & (
    #             (pl.col("from").str.to_lowercase() == indexed_address.lower())
    #             | (pl.col("to").str.to_lowercase() == indexed_address.lower())
    #         )
    #     )
    #     .collect()
    # )
    #
    # # pl.read_delta("s3://dp-dev-temporal-data/evm2/transactions").filter(
    #
    # # dt = pl.from_arrow(DeltaTable("s3://dp-dev-temporal-data/evm2/transactions").to_pyarrow_table(filters=filters).cast(transaction_schema)).lazy()
    # # dt = pl.from_arrow(df).lazy()
    # duckdb.sql("select * from dt").show()
    sync_client = HyperSync()
    query = sync_client.get_query(
        index_addresses=["0xea674fdde714fd979de3edf0f56aa9716b898ec8"],
        from_block=1_100_000,
        to_block=2_000_000,
    )
    (_, _, _, traces, _) = asyncio.run(sync_client.execute_indexed_address_query(query))

    duckdb.sql(
        "select * from traces as t where (t.reward_type = 'block' or t.reward_type = 'uncles') and t.from = '0xea674fdde714fd979de3edf0f56aa9716b898ec8'"
    ).show()
