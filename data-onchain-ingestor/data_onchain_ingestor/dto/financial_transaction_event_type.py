from enum import Enum


class FinancialTransactionEventType(str, Enum):
    ERC20_TRANSFER = "erc20_transfer"
    TRANSFER = "transfer"
    REWARD = "reward"
    UNCLE_REWARD = "uncle_reward"
    FEE = "fee"
    INTERNAL_TRANSFER = "internal_transfer"
    CONTRACT_CREATION = "contract_creation"
    POS_WITHDRAWALS = "pos_withdrawals"
    FAILED = "failed"
