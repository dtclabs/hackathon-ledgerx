import web3
from web3 import Web3

w3 = Web3(
    Web3.HTTPProvider(
        "https://ethereum-mainnet.core.chainstack.com/745ac612ffcb30485bad34d008bf398d"
    )
)

# Base reward amounts for different eras
BASE_REWARD = {
    "pre_eip_649": w3.to_wei(5, "ether"),  # Before block 4370000
    "pre_eip_1234": w3.to_wei(3, "ether"),  # Before block 7280000
    "post_eip_1234": w3.to_wei(2, "ether"),  # After block 7280000
    "post_merge": w3.to_wei(0, "ether"),  # After block 15537393 (PoS Merge)
}

one_eth = 10**18


# Get base reward for a block based on its number
def get_base_reward(block_number):
    if block_number < 4370000:
        return BASE_REWARD["pre_eip_649"]
    elif block_number < 7280000:
        return BASE_REWARD["pre_eip_1234"]
    elif block_number < 15537393:
        return BASE_REWARD["post_eip_1234"]
    else:
        return BASE_REWARD["post_merge"]


# Calculate block reward
def calculate_block_reward(block_number):
    block = w3.eth.get_block(hex(block_number), full_transactions=True)

    # Get the base reward for the block
    base_reward = get_base_reward(block_number)

    # Calculate transaction fees (miner tips)
    transaction_fees = 0
    burned_fees = 0
    for tx in block.transactions:
        receipt = w3.eth.get_transaction_receipt(tx["hash"])
        gas_used = receipt["gasUsed"]
        if "effectiveGasPrice" in receipt:
            gas_price = receipt["effectiveGasPrice"]
        else:
            gas_price = tx["gasPrice"] if "gasPrice" in tx else tx["maxFeePerGas"]
        transaction_fees += gas_used * gas_price
        if "baseFeePerGas" in block:
            burned_fees += gas_used * block["baseFeePerGas"]

    # Calculate uncle rewards
    uncle_reward = 0
    inclusive_reward = 0
    for index, uncle_hash in enumerate(block.uncles):
        uncle = w3.eth.get_uncle_by_block(block["hash"].hex(), index)
        uncle_number = uncle["number"]
        uncle_reward += (
            base_reward * (8 - (block["number"] - int(uncle_number, 16))) / 8
        )
        inclusive_reward += base_reward / 32

    print("Uncles reward: ", uncle_reward)
    print("base reward: ", base_reward)
    print("transaction_fees: ", transaction_fees)
    print("burned_fees: ", burned_fees)
    print("inclusive reward: ", inclusive_reward)
    total_reward = w3.from_wei(
        base_reward + transaction_fees + inclusive_reward - burned_fees, "ether"
    )
    return total_reward


# Main function to get rewards for the latest block and the five preceding blocks
def main():
    # latest_block_number = w3.eth.block_number
    # block_numbers = [latest_block_number - i for i in range(6)]  # Latest block and 5 preceding blocks
    #
    # for block_number  in block_numbers:
    reward = calculate_block_reward(7051114)
    print(f"Total reward for block {7051114}: {w3.from_wei(reward, 'ether')} ETH")


if __name__ == "__main__":
    main()
