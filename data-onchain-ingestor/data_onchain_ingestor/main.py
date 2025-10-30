import asyncio
import os
import time

from data_onchain_ingestor.entrypoint import main
from data_onchain_ingestor.workflow.temporal.worker_entrypoint import (
    main as worker_main,
)


def wait():
    while True:
        time.sleep(1000)


if __name__ == "__main__":
    print(os.getenv("ACTION"))
    action = os.getenv("ACTION")
    if action == "run_pipeline":
        asyncio.run(main=main())
        # stay alive to test remotely
        wait()
    elif action == "run_worker":
        asyncio.run(main=worker_main())
    else:
        # stay alive to test remotely
        wait()
