import logging
import os
import sys
from typing import Optional

import colorlog
from dotenv import load_dotenv

from data_onchain_ingestor.config.chain import Chain
from data_onchain_ingestor.config.environment import Environment

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
HYPERSYNC_ENDPOINT = os.getenv("HYPERSYNC_ENDPOINT")

LAKEHOUSE_BUCKET = os.getenv("LAKEHOUSE_BUCKET", f"s3://dp-{ENVIRONMENT}-temporal-data")

# ====== R2 ACCESS =============
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")

CACHE_HOST = os.getenv("CACHE_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
DATABASE_URI = os.getenv(
    "DATABASE_URI", "postgresql://airflow:airflow@localhost:5432/postgres"
)
SLACK_DEFAULT_CHANNEL = os.getenv("SLACK_DEFAULT_CHANNEL", "C06DHQ5G48Y")
SLACK_TOKEN = os.getenv("SLACK_TOKEN", "xoxb-xxxx")
WORKFLOW_SERVER_URI = os.getenv("WORKFLOW_SERVER_URI", "http://localhost:8080")
WORKFLOW_SERVER_PORT = os.getenv("WORKFLOW_SERVER_PORT", 8080)
WORKFLOW_NAMESPACE = os.getenv("WORKFLOW_NAMESPACE", "default")
HEALTH_CHECK_PORT = int(os.getenv("HEALTH_CHECK_PORT", 7098))

ADDRESS_SYNC_WORKFLOW_TASK_QUEUE = os.getenv(
    "ADDRESS_SYNC_WORKFLOW_TASK_QUEUE", "address-sync"
)
ADDRESS_SYNC_WORKFLOW_TIMEOUT = int(os.getenv("ADDRESS_SYNC_WORKFLOW_TIMEOUT", 600))

ADDRESS_SYNC_WORKFLOW_RETRY_INTERVAL = int(
    os.getenv("ADDRESS_SYNC_WORKFLOW_RETRY_INTERVAL", 60)
)

SUPPORTED_CHAINS = [
    Chain.SOLANA
]

SENTRY_DSN = os.getenv("SENTRY_DSN", None)

TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

DEPOSIT_TOPIC = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c"

WITHDRAWAL_TOPIC = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65"

RPC_URL = os.getenv("RPC_URL")

HELIUS_API_KEY = os.getenv("HELIUS_API_KEY", "")

SLACK_ENABLED = os.getenv("SLACK_ENABLED", False)


############# Logging #############
def configure_logging() -> None:
    logger = logging.getLogger("INGESTOR")
    stdout = colorlog.StreamHandler(stream=sys.stdout)
    logger.propagate = False

    if not logger.hasHandlers():
        if ENVIRONMENT in [Environment.LOCAL, Environment.DEVELOPMENT]:
            fmt = colorlog.ColoredFormatter(
                "[%(asctime)s]%(white)s[%(threadName)-10s]%(red)s[%(name)s]%(green)s %(levelname)-1s %(cyan)s| %(purple)s%(message)s"
            )
            logger.setLevel(logging.DEBUG)

        else:
            fmt = colorlog.ColoredFormatter(
                "[%(asctime)s][%(threadName)-10s][%(name)s] %(levelname)-1s | %(message)s"
            )
            logger.setLevel(logging.INFO)

        stdout.setFormatter(fmt)
        logger.addHandler(stdout)


configure_logging()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    default_name = "INGESTOR"
    if name is not None:
        default_name = f"{default_name}.{name}"
    return logging.getLogger(default_name)


############# ======= #############

############# WEBHOOK #############
WEBHOOK_ENDPOINT = os.getenv("WEBHOOK_ENDPOINT", "http://localhost:8080")