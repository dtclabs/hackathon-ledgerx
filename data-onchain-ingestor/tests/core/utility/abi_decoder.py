from data_onchain_ingestor.core.utility.abi_decoder import parse_log_by_event


def test_parse_log_by_event() -> None:
    log_data = {
        "address": "0x1234567890abcdef1234567890abcdef12345678",
        "block_hash": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
        "block_number": 12345,
        "data": "0x0000000000000000000000000000000000000000000000000000000000000042",
        "log_index": 0,
        "removed": False,
        "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000001234567890abcdef1234567890abcdef12345678",
            "0x000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcdef",
        ],
        "transaction_hash": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
        "transaction_index": 0,
    }

    # Use the TransferEventDecoder to decode the log
    log_data = parse_log_by_event(
        topics=[
            log_data.get("topics")[0],  # type: ignore
            log_data.get("topics")[1],  # type: ignore
            log_data.get("topics")[2],  # type: ignore
        ],
        data=log_data["data"],
    )
    assert log_data["from"] == "0x1234567890abcdef1234567890abcdef12345678"
    assert log_data["to"] == "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    assert log_data["value"] == 66
