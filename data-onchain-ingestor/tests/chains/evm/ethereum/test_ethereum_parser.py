import polars as pl
import pytest

from data_onchain_ingestor.chains.evm.ethereum.ethereum_parser import EthereumParser


@pytest.fixture
def setup_raw_transactions() -> pl.LazyFrame:
    raw_transactions = {
        "log_index": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "hash": [1, 1, 1, 1, 5, 2, 2, 2, 3, 3, 4],
        "block_number": [1, 1, 1, 1, 5, 2, 2, 2, 3, 3, 4],
        "transaction_index": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "from": ["A", "B", "B", "F", "D", "X", "Y", "Y", "T", "H", "I"],
        "to": ["B", "C", "D", "Q", "K", "Y", "Z", "W", "H", "K", "J"],
        "amount": [200, 150, 50, 20, 70, 300, 200, 100, 25, 25, 1345],
    }
    return pl.LazyFrame(raw_transactions)


def test_handle_logs_proxies(setup_raw_transactions: pl.LazyFrame) -> None:
    result = EthereumParser.handle_logs_proxies(setup_raw_transactions).collect()
    expected = pl.DataFrame(
        {
            "log_index": [2, 3, 4, 7, 8, 10, 11, 5],
            "hash": [1, 1, 1, 2, 2, 3, 4, 5],
            "block_number": [1, 1, 1, 2, 2, 3, 4, 5],
            "transaction_index": [1, 1, 4, 6, 6, 9, 11, 5],
            "from": ["A", "A", "F", "X", "X", "T", "I", "D"],
            "to": ["C", "D", "Q", "Z", "W", "K", "J", "K"],
            "amount": [150, 50, 20, 200, 100, 25, 1345, 70],
        }
    )

    assert result.equals(expected)
