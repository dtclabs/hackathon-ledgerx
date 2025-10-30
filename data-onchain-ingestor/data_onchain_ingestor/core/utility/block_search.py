import polars as pl
from data_onchain_ingestor.chains.providers import RPC
from data_onchain_ingestor.config.config import get_logger


class BlockSearch:
    def __init__(
        self,
        address: str,
        internal_data: pl.DataFrame,
        erc20_address: str = None,
        decimals: int = 18,
        accepted_deviation_percent: float = 0.01,
    ):
        self.address = address
        self.internal_data = internal_data
        self.erc20_address = erc20_address
        self.decimals = decimals
        self.logger = get_logger(__name__)
        self.accepted_deviation_percent = accepted_deviation_percent

    def find_divergent_block(
        self,
    ) -> int | None:
        processed_internal_balance = (
            self.internal_data.unique().sort(by="block_number").with_row_index()
        )
        self.logger.debug(f"Internal balance {processed_internal_balance}")

        result_block_number = None
        for index in processed_internal_balance["index"]:
            balance = processed_internal_balance["balance"][index]
            block_number = processed_internal_balance["block_number"][index]
            self.logger.debug(
                f"Currently at block number {block_number} with db's balance = {balance}"
            )
            rpc_balance = self.get_balance(block_number)
            int_rpc_balance = int(rpc_balance[0]["balance"]) / 10**self.decimals
            deviation = 0
            if balance > 0:
                deviation = (abs(int_rpc_balance - balance) / balance) * 100

            if deviation > self.accepted_deviation_percent and index > 0:
                self.logger.debug(
                    f"Got here because for block number {block_number}, rpc got {int_rpc_balance}"
                    f"but our db got {balance}"
                )
                from_block_number = processed_internal_balance["block_number"][
                    index - 1
                ]
                from_block_balance = processed_internal_balance["balance"][index - 1]

                result_block_number = self.binary_search_block_range(
                    from_block_number, from_block_balance, block_number
                )
                if result_block_number is None:
                    return int(block_number)
                break
            elif int_rpc_balance == balance:
                self.logger.debug(
                    f"I'm here for block number {block_number} and the balance is equal to rpc"
                )
        return result_block_number

    def binary_search_block_range(
        self,
        from_block_number: int,
        from_block_balance: float,
        to_block_number: int,
    ) -> int | None:
        """
        This function is used to find the  problematic block that might contain the
        event that our evm pipelines have not covered

        Implementation:
            Function binary_search_block_range:

                1) use the last block that internal balance == rpc's balance as from_block
                2) use the current block that internal balance != rpc's balance as to_block
                3) conduct binary search in binary_search_block_range with
                 input from_block (step 1), to_block (step 2) and find the first block that occur
                 difference between internal data address balance (from_block) and RPC address balance

        Parameters:
            :param from_block_number: int
            :param from_block_balance: float
            :param to_block_number: int
        :return: handled DataFrame with correct mapping of sender and receiver
        """
        # binary search here
        low = from_block_number
        high = to_block_number

        first_divergent_block = None
        while low <= high:
            middle_block_number = (high + low) // 2
            rpc_balance_at_mid = self.get_balance(middle_block_number)

            int_rpc_balance_at_mid = (
                int(rpc_balance_at_mid[0]["balance"]) / 10**self.decimals
            )

            self.logger.debug(
                f"Binary Search block {middle_block_number} rpc balance {int_rpc_balance_at_mid} and our balance {from_block_balance}",
            )
            if int_rpc_balance_at_mid != from_block_balance:
                first_divergent_block = middle_block_number
                # look for the left half since divergent has occured prior to middle block#
                high = middle_block_number - 1
            else:
                # continue to look at the right half since divergent has not occured
                low = middle_block_number + 1

        return first_divergent_block

    def get_balance(self, block_number: int) -> list[dict[str, object]]:
        if self.erc20_address:
            return RPC.get_erc20_balances(
                self.address, self.erc20_address, [block_number]
            )
        else:
            return RPC.get_balances(self.address, [block_number])
