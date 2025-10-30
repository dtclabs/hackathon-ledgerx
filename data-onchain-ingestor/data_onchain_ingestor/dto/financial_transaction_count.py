from typing import Any, List

from pydantic import BaseModel, Field


class FinancialTransactionCount(BaseModel):
    def __init__(self, **data: Any):
        super().__init__(**data)

    @staticmethod
    def table_name() -> str:
        return "financial_transaction_count"

    @staticmethod
    def unique_keys() -> List[str]:
        return ["chain_id", "indexed_address"]

    indexed_address: str
    chain_id: str
    financial_transaction_count: int = Field(default=0)
