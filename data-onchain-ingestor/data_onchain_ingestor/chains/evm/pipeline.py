from data_onchain_ingestor.chains.evm.ethereum.ethereum_parser import EthereumParser
from data_onchain_ingestor.chains.providers.hypersync import HyperSync
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse

client = HyperSync()
query = client.get_query(["0x77016474B3FFf23611cB827efBADaEa44f10637c"])


async def start() -> None:
    r = await client.execute_query(query)

    client1 = LakeHouse("s3://dp-dev-temporal-data/delta-lake/tx25534xxxxxx/")
    client1.write(
        data=r[3],
        partition_by=None,
        name="tx25534xxxxxx",
        mode="overwrite",
        z_order=["transaction_hash"],
    )
    client1.compact("tx25534xxxxxx")
    client1.vacuum("tx25534xxxxxx")
    # write_deltalake(
    #     data=r[4],
    #     table_or_uri="s3://dp-dev-temporal-data/delta-lake/tx2553/",
    #     mode="overwrite",
    #     name="tx2553"
    # )


async def sync() -> None:
    client = HyperSync()

    address = "0x2232921004D6f0C9aF499924d937F158E4C315Ea"
    # query = client.get_query(["0x2232921004D6f0C9aF499924d937F158E4C315Ea"])
    query = client.get_query([address])
    blocks, transactions, logs, traces = await client.execute_query(query)

    # block_number_params = (
    #     polars.from_arrow(blocks)
    #     .select("number")
    #     .unique()
    #     .get_column("number")
    #     .to_list()
    # )
    # block_numbers = RPC.get_balances(address, block_number_params)
    # # balances_df = polars.DataFrame(block_numbers)
    # # balances_df.write_csv(address + "balance.csv")

    # exit(0)
    # balances_df = polars.read_csv("balances.csv").lazy()

    p = EthereumParser(
        index_address=address,
        blocks=blocks,
        transactions=transactions,
        logs=logs,
        traces=traces,
        coin_gecko_client=CoinGecko(),
        debug_mode=True,
    )

    # transactions = p.get_financial_transactions(balances_df=balances_df)
    transactions = p.get_financial_transactions()
    # db = Persistent("postgresql://airflow:airflow@localhost:5432/postgres")
    # # db.write(transactions, name="financial_transactions", mode="append")
    # tokens_info, token_cross_chains = p.get_token_metadata()
    # db.write(tokens_info, name="tokens", mode="upsert", unique_keys=["symbol"])
    # # db.write(token_cross_chains, name="token_cross_chains", mode="append", unique_keys=["contract_address", "chain"])
    # db.write(
    #     transactions.unique(subset="transaction_id"),
    #     name="financial_transactions",
    #     mode="upsert",
    #     unique_keys=["transaction_id"],
    # )

    p.get_financial_transactions_aggregate_stats(transactions)


# asyncio.run(sample())
