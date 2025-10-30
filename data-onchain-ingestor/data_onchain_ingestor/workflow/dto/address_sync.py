from typing import Optional

from pydantic import BaseModel

from data_onchain_ingestor.dto.sync_mode import SyncMode


class AddressSync(BaseModel):
    """
    Model that contains information to trigger address workflow
    """

    address: str
    job_id: str
    sync_mode: Optional[SyncMode] = None
    from_block: Optional[int] = None
    to_block: Optional[int] = None
