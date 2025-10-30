import time
import typing as t
import requests
import pyarrow as pa

from data_onchain_ingestor.config.config import get_logger
from dataclasses import dataclass


# ---------- Arrow Schemas ----------

helius_tx_schema = pa.schema([
    ("signature", pa.string()),
    ("slot", pa.int64()),
    ("timestamp", pa.int64()),
    ("type", pa.string()),
    ("source", pa.string()),
    ("description", pa.string()),
    ("fee", pa.int64()),
    ("feePayer", pa.string()),
])

helius_native_transfer_schema = pa.schema([
    ("signature", pa.string()),          # FK -> transactions.signature
    ("slot", pa.int64()),
    ("fromUserAccount", pa.string()),
    ("toUserAccount", pa.string()),
    ("amount", pa.int64()),              # lamports
])

helius_token_transfer_schema = pa.schema([
    ("signature", pa.string()),          # FK -> transactions.signature
    ("slot", pa.int64()),
    ("fromTokenAccount", pa.string()),
    ("toTokenAccount", pa.string()),
    ("fromUserAccount", pa.string()),
    ("toUserAccount", pa.string()),
    ("tokenAmount", pa.float64()),       # Helius returns float; if you prefer fixed-precision, store as string
    ("mint", pa.string()),
    ("tokenStandard", pa.string()),      # e.g. "Fungible"
])

raw_token_amount_schema = pa.struct([
    ("tokenAmount", pa.string()),
    ("decimals", pa.int32()),
])

token_balance_change_schema = pa.struct([
    ("userAccount", pa.string()),
    ("tokenAccount", pa.string()),
    ("mint", pa.string()),
    ("rawTokenAmount", raw_token_amount_schema),
])

account_data_schema = pa.schema([
    ("signature", pa.string()),
    ("slot", pa.int64()),
    ("account", pa.string()),
    ("nativeBalanceChange", pa.int64()),
    ("tokenBalanceChanges", pa.list_(token_balance_change_schema)),
])

@dataclass
class HeliusQueryResult:
    transactions: t.Optional[pa.Table]
    native_transfers: t.Optional[pa.Table]
    token_transfers: t.Optional[pa.Table]
    account_data: t.Optional[pa.Table]
    next_from_signature: t.Optional[str]
    page: int
    limit: int
    next_slot: t.Optional[int]
    token_balance: t.Optional[pa.Table]


def _to_arrow_tables(index_addr: str, items_pylist: list[dict[str, t.Any]]) -> tuple[pa.Table | None, pa.Table | None, pa.Table | None, pa.Table | None, pa.Table | None]:
    """
    Convert a batch (list[dict]) from Helius into three Arrow tables:
    transactions, native_transfers, token_transfers.
    """
    tx_rows: list[dict[str, t.Any]] = []
    nt_rows: list[dict[str, t.Any]] = []
    tt_rows: list[dict[str, t.Any]] = []
    acc_rows: list[dict[str, t.Any]] = []
    token_balance: list[dict[str, t.Any]] = []

    token_balance_dict: dict[str, float] = {"solana": 0}
    for tx in items_pylist:
        slot = tx["slot"]
        sig = tx.get("signature")
        tx_rows.append({
            "signature": sig,
            "slot": tx.get("slot"),
            "timestamp": tx.get("timestamp"),
            "type": tx.get("type"),
            "source": tx.get("source"),
            "description": tx.get("description"),
            "fee": tx.get("fee"),
            "feePayer": tx.get("feePayer"),
        })
        if tx.get("feePayer") == index_addr:
            token_balance_dict["solana"] += tx.get("fee") / 10**9

        # nativeTransfers
        for nt in tx.get("nativeTransfers", []) or []:
            nt_rows.append({
                "signature": sig,
                "slot": slot,
                "fromUserAccount": nt.get("fromUserAccount"),
                "toUserAccount": nt.get("toUserAccount"),
                "amount": nt.get("amount"),  # lamports
            })
            if nt.get("toUserAccount") == index_addr or nt.get("fromUserAccount") == index_addr:
                token_balance_dict["solana"] += (1 if nt.get("fromUserAccount") == index_addr else -1) * (nt.get("amount") / 10**9)

        # tokenTransfers
        for tt in tx.get("tokenTransfers", []) or []:
            # tokenAmount is a float per Helius docs; be aware of FP precision for accounting
            token_amt = tt.get("tokenAmount")
            try:
                token_amt = float(token_amt) if token_amt is not None else None
            except Exception:
                token_amt = None

            tt_rows.append({
                "signature": sig,
                "slot": slot,
                "fromTokenAccount": tt.get("fromTokenAccount"),
                "toTokenAccount": tt.get("toTokenAccount"),
                "fromUserAccount": tt.get("fromUserAccount"),
                "toUserAccount": tt.get("toUserAccount"),
                "tokenAmount": token_amt,
                "mint": tt.get("mint"),
                "tokenStandard": tt.get("tokenStandard"),
            })
            if tt.get("fromUserAccount") == index_addr or tt.get("toUserAccount") == index_addr:
                if not token_balance_dict.get(tt.get("mint")):
                    token_balance_dict[tt.get("mint")] = 0
                token_balance_dict[tt.get("mint")] += (1 if tt.get("fromUserAccount") == index_addr else -1) * tt.get("tokenAmount")

        # accountData
        for ad in tx.get("accountData", []) or []:
            acc_rows.append({
                "signature": sig,
                "slot": slot,
                "account": ad.get("account"),
                "nativeBalanceChange": ad.get("nativeBalanceChange"),
                "tokenBalanceChanges": ad.get("tokenBalanceChanges") or [],
            })

    for k, v in token_balance_dict.items():
        token_balance.append({
            "address": k,
            "balance": v,
        })
    tx_tbl = pa.Table.from_pylist(tx_rows, schema=helius_tx_schema) if tx_rows else None
    nt_tbl = pa.Table.from_pylist(nt_rows, schema=helius_native_transfer_schema) if nt_rows else None
    tt_tbl = pa.Table.from_pylist(tt_rows, schema=helius_token_transfer_schema) if tt_rows else None
    acc_tbl = pa.Table.from_pylist(acc_rows, schema=account_data_schema) if acc_rows else None
    token_balance_tbl = pa.Table.from_pylist(token_balance) if token_balance else None
    return tx_tbl, nt_tbl, tt_tbl, acc_tbl, token_balance_tbl


class Helius:
    __uri: str
    __api_key: str

    def __init__(self, endpoint: str = "", api_key: str = None):
        self.logger = get_logger(__name__)
        self.__uri = endpoint.rstrip("/") if endpoint else "https://api.helius.xyz"
        self.__api_key = api_key

    def _build_url(self, address: str) -> str:
        return f"{self.__uri}/v0/addresses/{address}/transactions?api-key={self.__api_key}"

    def _fetch(
        self,
        url: str,
        before: t.Optional[str] = None,
        until: t.Optional[str] = None,
        limit: int = 100,
        timeout: int = 20,
    ) -> list[dict]:
        params: dict[str, t.Any] = {}
        if before:
            params["before"] = before
        if until:
            params["until"] = until
        if limit:
            params["limit"] = limit

        for attempt in range(5):  # simple retry loop
            try:
                resp = requests.get(url, params=params, timeout=timeout)
                if resp.status_code == 429:
                    # rate-limited → exponential backoff
                    wait = 2 ** attempt
                    self.logger.warning("Helius 429, backing off %ss...", wait)
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                data = resp.json()
                if not isinstance(data, list):
                    raise ValueError(f"Unexpected response: {data!r}")
                return data
            except Exception as e:
                if attempt == 4:
                    raise
                wait = 1.5 ** attempt
                self.logger.warning("Helius fetch failed (%s), retrying in %.1fs", e, wait)
                time.sleep(wait)
        return []

    def query(
        self,
        *,
        address: str,
        limit: int = 100,
        page: int = 1,
        from_signature: t.Optional[str] = None,
        until: t.Optional[str] = None,
    ) -> HeliusQueryResult:
        """
        Fetch parsed transaction history for a Solana address and return three Arrow tables.

        Args:
            address: Target Solana address.
            limit: Number of transactions per page (Helius default is 10).
            page: Page index (>=1). If page > 1, the client will loop using 'before'.
            from_signature: Fetch transactions *before* this signature (used for manual pagination).
            until: Fetch transactions *until* this signature.

        Returns:
            dict:
                {
                    "transactions": pa.Table | None,
                    "native_transfers": pa.Table | None,
                    "token_transfers": pa.Table | None,
                    "next_from_signature": str | None,
                    "page": int,
                    "limit": int,
                }
        """
        if page < 1:
            raise ValueError("page must be >= 1")
        if not address:
            raise ValueError("address is required")

        url = self._build_url(address)
        current_before = from_signature
        items_pylist: list[dict[str, t.Any]] = []

        # page=1 → fetch once; page>1 → iterate to advance to desired page.
        for p in range(1, page + 1):
            batch = self._fetch(url, before=current_before, until=until, limit=limit)
            if not batch:
                # no more data
                if p == page and not items_pylist:
                    return HeliusQueryResult(
                        transactions=None,
                        native_transfers=None,
                        token_transfers=None,
                        account_data=None,
                        next_from_signature=None,
                        page=p,
                        limit=limit,
                        next_slot=None,
                    )
                break
            if p == page:
                items_pylist = batch

            # set 'before' for next loop hop
            current_before = batch[-1].get("signature")

        next_from_signature = items_pylist[-1]["signature"] if items_pylist else None
        current_block = items_pylist[-1]["slot"] if items_pylist else None

        tx_tbl, nt_tbl, tt_tbl, acc_tbl = _to_arrow_tables(items_pylist) if items_pylist else (None, None, None)

        return HeliusQueryResult(
            transactions=tx_tbl,
            native_transfers=nt_tbl,
            token_transfers=tt_tbl,
            account_data=acc_tbl,
            next_from_signature=next_from_signature,
            page=page,
            limit=limit,
            next_slot=current_block+1,
        )

    def query_all(
            self,
            *,
            address: str,
            from_signature: t.Optional[str] = None,
            until: t.Optional[str] = None,
            limit: int = 100,
            max_pages: int = 10_000,
            sleep_sec: float = 0.1,
    ) -> HeliusQueryResult:
        """
        Fetch all transactions for a given address using cursor-based pagination.
        - If `from_signature` is provided → start from this signature and fetch backwards in time.
        - If `until` is provided → stop when this signature is reached.
        - If neither is provided → fetch from the latest transaction down to the genesis block.
        """
        url = self._build_url(address)
        all_items: list[dict[str, t.Any]] = []
        before = from_signature  # if None, Helius starts from the latest transaction

        page = 0
        for page in range(1, max_pages + 1):
            batch = self._fetch(url, before=before, until=until, limit=limit)
            if not batch:
                self.logger.info(f"[{address}] No more data after page {page - 1}")
                break

            self.logger.info(
                f"[{address}] Fetched page {page} successfully with {len(batch)} transactions (before={before})"
            )

            all_items.extend(batch)
            before = batch[-1].get("signature")  # move the cursor backward

            if sleep_sec > 0:
                time.sleep(sleep_sec)

        if not all_items:
            self.logger.warning(f"[{address}] No transactions found for the given range.")
            return HeliusQueryResult(
                transactions=None,
                native_transfers=None,
                token_transfers=None,
                account_data=None,
                next_from_signature=None,
                page=0,
                limit=limit,
                next_slot=None,
                token_balance=None
            )

        tx_tbl, nt_tbl, tt_tbl, acc_tbl, token_balance_tbl = _to_arrow_tables(address, all_items)
        next_from_signature = all_items[0].get("signature")
        next_slot = all_items[0].get("slot") + 1 if all_items else None

        self.logger.info(
            f"[{address}] Finished fetching: total {len(all_items)} transactions across {page} pages"
        )

        return HeliusQueryResult(
            transactions=tx_tbl,
            native_transfers=nt_tbl,
            token_transfers=tt_tbl,
            account_data=acc_tbl,
            next_from_signature=next_from_signature,
            page=len(all_items) // limit,
            limit=limit,
            next_slot=next_slot,
            token_balance=token_balance_tbl,
        )
