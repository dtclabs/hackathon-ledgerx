import concurrent.futures
from typing import Any, Tuple

import requests


class TokenMetadata:
    @staticmethod
    def get_token_metadata0(token_address: str) -> Tuple[bool, str, int]:
        url = f"https://pro-api.coingecko.com/api/v3/coins/id/contract/{token_address}"
        headers = {"Content-Type": "application/json", "x-cg-pro-api-key": ""}
        response = requests.get(url, headers=headers)
        print(response.status_code)
        if response.status_code == 200:
            data = response.json()
            return (
                False,
                data["symbol"],
                data["detail_platforms"]["ethereum"]["decimal_place"],
            )
        else:
            return True, token_address, 0

    @staticmethod
    def get_tokens(
        token_addresses: list[str], chain: str
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        # Use concurrency futures to get token metadata
        tokens_info = []
        token_cross_chain = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(TokenMetadata.get_token_metadata, token, chain)
                for token in token_addresses
            ]
            tokens = [future.result() for future in futures]
            for token in tokens:
                if token[0]:
                    tokens_info.append(token[0])
                if token[1]:
                    token_cross_chain += token[1]

        print(tokens_info)
        import json

        print(json.dumps(token_cross_chain))
        return tokens_info, token_cross_chain

    @staticmethod
    def get_token_metadata(
        token_address: str, chain: str
    ) -> Tuple[dict[str, Any], list[dict[str, Any]]]:
        url = f"https://pro-api.coingecko.com/api/v3/coins/id/contract/{token_address}"
        headers = {
            "Content-Type": "application/json",
            "x-cg-pro-api-key": "CG-YBGRcMAowf3594ozr7ycYRiV",
        }
        response = requests.get(url, headers=headers)

        token_across_chains = []
        if response.status_code == 200:
            data = response.json()

            token = {
                "symbol": data["symbol"].upper(),
                "name": data["name"],
                "description": data["description"]["en"],
                "image_url": data["image"]["small"],
                "owner": None,
                "extra": None,
                "decimals": data["detail_platforms"][chain]["decimal_place"],
                "address": token_address,
                "is_spam": False,
            }

            for chain_id, info in data["detail_platforms"].items():
                token_chain = {
                    "contract_address": info["contract_address"],
                    "symbol": data["symbol"].upper(),
                    "chain": chain_id,
                    "decimal": info["decimal_place"],
                    "is_spam": False,
                }
                token_across_chains.append(token_chain)

            return token, token_across_chains
        elif response.status_code == 404:
            token = {
                "symbol": token_address,
                "name": None,
                "description": None,
                "image_url": None,
                "owner": None,
                "extra": None,
                "decimals": None,
                "address": token_address,
                "is_spam": True,
            }
            return token, []
        else:
            raise Exception(
                f"Failed to get token metadata for {token_address}: {response.text}"
            )
