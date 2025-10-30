from enum import Enum


class Environment(str, Enum):
    DEVELOPMENT = "develop"
    STAGING = "staging"
    PRODUCTION = "production"
    LOCAL = "local"
