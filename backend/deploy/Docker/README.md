# LedgerX backend deploy/runtime

## local-development

### Prerequisites

**Docker Engine + Docker Compose**

Both can be acquired at once by [installing Docker Desktop](https://docs.docker.com/compose/install/#scenario-one-install-docker-desktop)

Or seperately with [just Docker Compose](https://docs.docker.com/compose/install/#scenario-two-install-the-compose-plugin) after acquired [Docker Engine from other sources](https://docs.docker.com/engine/install/).

### Getting started

To start local development, with **auto-rebuild on saved-changes** to any files/dir in `../../backend/src`, at the same dir as this README.md, run

```bash
docker compose up -d db # start DB in the background
docker compose up app
```

Wait for a bit to have:

- a PostgreSQL instance listening on `127.0.0.1:5432`
- a backend-app instance listening on `127.0.0.1:3001`

### Further operations

To stop

```bash
docker compose down
```

To reset/wipe

```bash
docker compose down -v --rmi all --remove-orphans
```

Notice, changes to any other locations beside `../../backend/src/*` (such as `../../backend/package.json`) require manual stop/restart:

```bash
docker compose down db-migrate app
docker compose up --build --attach-dependencies app
```
