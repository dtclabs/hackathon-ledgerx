from enum import Enum


class SyncMode(str, Enum):
    HISTORICAL = "HISTORICAL"
    INCREMENTAL = "INCREMENTAL"
