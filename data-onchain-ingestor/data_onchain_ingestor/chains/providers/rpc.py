import concurrent.futures

from web3 import Web3, contract
from data_onchain_ingestor.config.config import RPC_URL


class RPC:
    @staticmethod
    def get_balances(address: str, block_numbers: list[int]) -> list[dict[str, object]]:
        web3 = Web3(Web3.HTTPProvider(RPC_URL))

        balances = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = [
                executor.submit(RPC.get_balance, address, block, web3)
                for block in block_numbers
            ]
            for future in futures:
                balance = future.result()
                balances.append(balance)
        return balances

    @staticmethod
    def get_balance(address: str, block: int, web3: Web3) -> dict[str, object]:
        address = web3.to_checksum_address(address)
        balance = web3.eth.get_balance(address, block)
        print(f"Block: {block}, Balance: {balance}")
        return {"block_number": block, "balance": str(balance)}

    @staticmethod
    def get_erc20_balances(
        address: str, erc20_address: str, block_numbers: list[int]
    ) -> list[dict[str, object]]:
        web3 = Web3(Web3.HTTPProvider(RPC_URL))

        # Create the contract instance
        abi = [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function",
            }
        ]

        erc20_address = web3.to_checksum_address(erc20_address)
        address = web3.to_checksum_address(address)
        erc20_contract = web3.eth.contract(address=erc20_address, abi=abi)

        balances = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = [
                executor.submit(RPC.get_erc20_balance, address, block, erc20_contract)
                for block in block_numbers
            ]
            for future in futures:
                balance = future.result()
                balances.append(balance)
        return balances

    @staticmethod
    def get_erc20_balance(
        address: str, block: int, erc20_contract: contract.Contract
    ) -> dict[str, object]:
        balance = erc20_contract.functions.balanceOf(address).call(
            block_identifier=block
        )
        print(f"Block: {block}, Balance: {balance}")
        return {"block_number": block, "balance": str(balance)}
