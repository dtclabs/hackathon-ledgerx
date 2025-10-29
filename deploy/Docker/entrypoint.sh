#!/bin/bash
set -euo pipefail
npm run build
export DATABASE_URL=postgresql://${USER_NAME_DATABASE}:${PASSWORD_DATABASE}@${ENDPOINT_DATABASE}/${NAME_DATABASE}
exec pm2-runtime start dist/main.js --name app --time
