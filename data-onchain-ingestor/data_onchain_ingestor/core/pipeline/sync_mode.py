from enum import Enum


class SyncMode(Enum):
    HISTORICAL = "HISTORICAL"
    INCREMENTAL = "INCREMENTAL"
