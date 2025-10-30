import time
import requests
from typing import Optional, Iterable

# -----------------------------
# RPC wrapper
# -----------------------------
class SolanaRPC:
    def __init__(
        self,
        rpc_url: str,
        timeout: int = 20,
        max_retries: int = 3,
        backoff: float = 0.5,
        commitment: str = "finalized",  # "processed" | "confirmed" | "finalized"
        max_supported_tx_version: int = 0,
    ):
        self.rpc_url = rpc_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff = backoff
        self.commitment = commitment
        self.max_supported_tx_version = max_supported_tx_version

    def _call(self, method: str, params: list):
        payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
        last_err = None
        for attempt in range(self.max_retries):
            try:
                r = requests.post(self.rpc_url, json=payload, timeout=self.timeout)
                r.raise_for_status()
                data = r.json()
                if "error" in data:
                    raise RuntimeError(data["error"])
                return data.get("result")
            except Exception as e:
                last_err = e
                time.sleep(self.backoff * (attempt + 1))
        raise last_err

    def get_block(self, slot: int) -> Optional[dict]:
        """
        Return block JSON or None if the slot was skipped / RPC does not have the block.
        """
        params = [
            slot,
            {
                "commitment": self.commitment,
                "transactionDetails": "full",
                "rewards": False,
                "maxSupportedTransactionVersion": self.max_supported_tx_version,
            },
        ]
        try:
            return self._call("getBlock", params)
        except Exception:
            return None
