#!/usr/bin/env bash
set -e

echo "Starting container with ACTION=${ACTION}"

if [ "$ACTION" = "worker" ]; then
    echo "Running Temporal Worker..."
    exec python -m data_onchain_ingestor.workflow.temporal.worker_entrypoint
elif [ "$ACTION" = "api" ]; then
    echo "Running FastAPI server..."
    exec uvicorn api.main:app --host 0.0.0.0 --port 8000
else
    echo "Unknown ACTION: ${ACTION}"
    exit 1
fi
