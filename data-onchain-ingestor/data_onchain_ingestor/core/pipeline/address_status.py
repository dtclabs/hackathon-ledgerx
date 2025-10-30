from enum import Enum


class AddressStatus(Enum):
    SYNCING = 0
    COMPLETED = 1
    FAILED = 2
    QUEUED = 3
    RESERVED = 4
    WAITING = 5
    STOPPED = 6
