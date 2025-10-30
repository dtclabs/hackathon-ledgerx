from typing import List, Any
import polars as pl

from data_onchain_ingestor.chains.providers.token_metadata import TokenMetadata
from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.config import get_logger
from data_onchain_ingestor.core.storage.lakehouse import LakeHouse
from data_onchain_ingestor.core.storage.persistent import Persistent

WSOL_MINT = "So11111111111111111111111111111111111111112"
NATIVE_SOL_ADDR = "solana"
NATIVE_SOL_DEC = 9


def _native_sol_row() -> dict:
    return {
        "symbol": "SOL",
        "decimals": NATIVE_SOL_DEC,
        "address": NATIVE_SOL_ADDR,
        "is_spam": False,
    }


BATCH = 30

def _to_pl_tokens_min(rows: list[dict]) -> pl.DataFrame:
    # chỉ giữ 4 cột nhẹ, ép schema rõ ràng
    return pl.DataFrame(
        {
            "symbol":   [r.get("symbol") for r in rows],
            "decimals": [r.get("decimals") for r in rows],
            "address":  [r.get("address") for r in rows],
            "is_spam":  [bool(r.get("is_spam", False)) for r in rows],
        },
        schema={"symbol": pl.Utf8, "decimals": pl.Int64, "address": pl.Utf8, "is_spam": pl.Boolean},
    )

def _chunked(iterable, size):
    for i in range(0, len(iterable), size):
        yield iterable[i:i+size]

class TokenService:
    def __init__(
            self,
            chain: Chain,
            persistent_client: Persistent,
            lakehouse_client: LakeHouse,
            token_metadata_client: TokenMetadata,
    ):
        self.persistent_client = persistent_client
        self.lakehouse_client = lakehouse_client
        self.token_metadata_client = token_metadata_client
        self.chain = chain
        self.logger = get_logger(__name__)

    def get_tokens(self, tokens: List[str]) -> pl.DataFrame:
        """
        Get token metadata from the database, if not found, call the service to get the metadata
        :param tokens: token retrieved from data client
        :return: tokens metadata DataFrame
        """

        query = f"""
            SELECT symbol, decimals, address, is_spam
            FROM tokens
            WHERE address IN ({', '.join([f"'{token}'" for token in tokens])})
        """

        persisted_tokens_df = self.persistent_client.read(query)
        persisted_tokens = (
            persisted_tokens_df.select("address")
            .unique()
            .get_column("address")
            .to_list()
        )

        # Get difference between tokens and persisted_tokens
        new_tokens = list(set(tokens) - set(persisted_tokens))
        self.logger.info(f"Found {len(new_tokens)} new tokens")

        # append native token
        # new_tokens.append()

        if new_tokens:
            new_tokens_df = self.get_token_metadata(new_tokens)
            return pl.concat([persisted_tokens_df, new_tokens_df], rechunk=True)
        else:
            return persisted_tokens_df

    def get_token_metadata(self, tokens: list[str]) -> pl.DataFrame:
        tokens = [t.strip() for t in tokens if t and t.strip()]
        tokens = list({t for t in tokens})

        if not tokens:
            return pl.DataFrame([_native_sol_row()],
                                schema={"symbol": pl.Utf8, "decimals": pl.Int64, "address": pl.Utf8,
                                        "is_spam": pl.Boolean})

        tokens_info, token_cross_chains = self.token_metadata_client.get_tokens(tokens, self.chain.value)

        # --- normalize each row & keep only required fields ---
        rows = []
        for it in tokens_info or []:
            addr = it.get("address") or ""
            sym = it.get("symbol")
            dec = it.get("decimals")
            spam = it.get("is_spam")

            # Fix WSOL metadata if provider returns wrong fields
            if addr == WSOL_MINT:
                sym = "WSOL"
                dec = NATIVE_SOL_DEC

            rows.append({
                "symbol": str(sym) if sym is not None else None,
                "decimals": int(dec) if dec is not None else None,  # nullable Int64
                "address": str(addr),
                "is_spam": bool(spam) if spam is not None else False,
            })

        # Save (original full objects) if needed
        if tokens_info or token_cross_chains:
            self.save_token_metadata(tokens_info, token_cross_chains)

        schema = {"symbol": pl.Utf8, "decimals": pl.Int64, "address": pl.Utf8, "is_spam": pl.Boolean}
        df = pl.DataFrame(rows, schema=schema) if rows else pl.DataFrame(schema=schema)
        df = df.unique(subset=["address"], keep="last")
        # Always add native SOL
        # df = pl.concat([df, pl.DataFrame([_native_sol_row()], schema=schema)], how="vertical").unique(
        #     subset=["address"], keep="last")

        return df.select(["symbol", "decimals", "address", "is_spam"])

    def save_token_metadata(
            self,
            tokens_info: list[dict[str, Any]],
            token_cross_chains: list[dict[str, Any]],
    ) -> None:
        if tokens_info:
            cleaned = []
            seen = set()
            for it in tokens_info:
                addr = it.get("address")
                sym = it.get("symbol")
                # enforce WSOL normalization once more (defensive)
                if addr == WSOL_MINT:
                    sym = "WSOL"
                    it["symbol"] = sym
                    it["decimals"] = NATIVE_SOL_DEC
                if sym not in seen:
                    seen.add(sym)
                    cleaned.append(it)

            for batch in _chunked(cleaned, BATCH):
                df = _to_pl_tokens_min(batch)
                if df.height == 0:
                    continue
                self.persistent_client.write(
                    df, name="tokens", mode="append", unique_keys=["symbol"]
                )

        if token_cross_chains:
            for batch in _chunked(token_cross_chains, BATCH):
                self.persistent_client.write(
                    batch,
                    name="token_cross_chains",
                    mode="upsert",
                    unique_keys=["contract_address", "chain"],
                )
