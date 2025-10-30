from typing import List

from pydantic import BaseModel


class JobRegistry(BaseModel):
    @staticmethod
    def table_name() -> str:
        return "address_jobs"

    @staticmethod
    def on_conflict_fields() -> List[str]:
        return ["run_id"]

    id: str
    run_id: str
    chain_id: str
    status: str
    indexed_address: str
    created_at: str
    updated_at: str
