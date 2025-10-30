from abc import ABC, abstractmethod
from typing import Dict, Any, List

from eth_abi import decode

from data_onchain_ingestor.config.config import (
    DEPOSIT_TOPIC,
    TRANSFER_TOPIC,
    WITHDRAWAL_TOPIC
)


empty_log_event_data = {"from": None, "to": None, "amount": None}


class ABIDecoder(ABC):
    # Abstract base class for ABI decoders
    @abstractmethod
    def decode_log(self, topics: List[str], data: str) -> Dict[str, Any]:
        pass


class DepositEventDecoder(ABIDecoder):
    # Decoder class for the Deposit event
    def __init__(self) -> None:
        self.event_abi: Dict[str, Any] = {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "name": "dst", "type": "address"},
                {"indexed": False, "name": "wad", "type": "uint256"},
            ],
            "name": "Deposit",
            "type": "event",
        }
        self._event_signature = DEPOSIT_TOPIC

    def decode_log(self, topics: List[str], data: str) -> Dict[str, Any]:
        if topics[1] is None or data is None:
            return empty_log_event_data
        # Decode indexed parameters (dst)
        to_address = decode(["address"], bytes.fromhex(topics[1][2:]))

        if bytes.fromhex(data[2:]):
            wad = decode(["uint256"], bytes.fromhex(data[2:]))[0]
        else:
            wad = 0
        # Decode non-indexed parameters (wad)

        # Return the decoded log data
        return {
            "from": None,
            "to": to_address[
                0
            ],  # to is the same as from because it's a deposit to the contract
            "amount": str(wad),
            "type": self.event_abi["name"],
        }


class WithdrawalEventDecoder(ABIDecoder):
    # Decoder class for the Withdrawal event
    def __init__(self) -> None:
        self.event_abi: Dict[str, Any] = {

                "anonymous": False,
                "inputs": [
                    {"indexed": True, "name": "src", "type": "address"},
                    {"indexed": False, "name": "wad", "type": "uint256"}
                ],
                "name": "Withdrawal",
                "type": "event"
        }
        self._event_signature = WITHDRAWAL_TOPIC

    def decode_log(self, topics: List[str], data: str) -> Dict[str, Any]:
        if topics[1] is None or data is None:
            return empty_log_event_data
        # Decode indexed parameters (dst)
        from_address = decode(["address"], bytes.fromhex(topics[1][2:]))

        if bytes.fromhex(data[2:]):
            wad = decode(["uint256"], bytes.fromhex(data[2:]))[0]
        else:
            wad = 0
        # Decode non-indexed parameters (wad)

        # Return the decoded log data
        return {
            "from": from_address[
                0
            ],
            "to": None,
            "amount": str(wad),
            "type": self.event_abi["name"],
        }


class TransferEventDecoder(ABIDecoder):
    # Decoder class for the Transfer event
    def __init__(self) -> None:
        self.event_abi: Dict[str, Any] = {
            "anonymous": False,
            "inputs": [
                {"indexed": True, "name": "from", "type": "address"},
                {"indexed": True, "name": "to", "type": "address"},
                {"indexed": False, "name": "value", "type": "uint256"},
            ],
            "name": "Transfer",
            "type": "event",
        }
        self._event_signature = TRANSFER_TOPIC

    def decode_log(self, topics: List[str], data: str) -> Dict[str, Any]:
        if topics[1] is None or topics[2] is None or data is None:
            return empty_log_event_data
        # Decode indexed parameters (from_address and to_address)
        from_address = decode(["address"], bytes.fromhex(topics[1][2:]))
        to_address = decode(["address"], bytes.fromhex(topics[2][2:]))

        # Decode non-indexed parameter (value)
        if bytes.fromhex(data[2:]):
            value = decode(["uint256"], bytes.fromhex(data[2:]))[0]
        else:
            value = 0
        # Return the decoded log data
        return {
            "from": from_address[0],
            "to": to_address[0],
            "amount": str(value),
            "type": self.event_abi["name"],
        }


def parse_log_by_event(topics: List[str], data: str) -> Dict[str, Any]:
    # Function to get log data based on the event signature
    if topics[0] == DEPOSIT_TOPIC:
        return DepositEventDecoder().decode_log(topics, data)
    if topics[0] == TRANSFER_TOPIC:
        return TransferEventDecoder().decode_log(topics, data)
    if topics[0] == WITHDRAWAL_TOPIC:
        return WithdrawalEventDecoder().decode_log(topics, data)

    return empty_log_event_data
