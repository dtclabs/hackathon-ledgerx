from typing import List

from pydantic import BaseModel


class AddressRegistry(BaseModel):
    @staticmethod
    def table_name() -> str:
        return "address_registry"

    @staticmethod
    def on_conflict_fields() -> List[str]:
        return ["register_id"]

    register_id: str
    chain_id: str
    indexed_address: str
    status: int
    is_scheduled: bool
    created_at: str
    updated_at: str
