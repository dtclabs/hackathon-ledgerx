# ---------- Stage 1: Builder ----------
FROM node:20-bookworm-slim AS builder

# Enable Corepack + Yarn 4
RUN corepack enable && corepack prepare yarn@4.2.2 --activate

# Workdir
WORKDIR /home/app

# Copy lockfiles trước để cache dependency
COPY backend/package.json backend/yarn.lock ./

# Cài deps cho build (bao gồm devDependencies)
RUN yarn install --immutable

# Copy toàn bộ source backend và build
COPY backend/ .
RUN yarn build


# ---------- Stage 2: Runtime (Production) ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production

# (Tùy chọn) Cài PM2 cho Docker
RUN npm i -g pm2@5

WORKDIR /home/app

# Cố định Yarn 4 ở runtime
RUN corepack enable && corepack prepare yarn@4.2.2 --activate

# Chỉ cài production deps
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --immutable --production=true

# Copy artifact đã build từ stage builder
COPY --from=builder /home/app/dist ./dist

# Copy entrypoint và set quyền thực thi (dùng BuildKit để set mode luôn)
COPY --chmod=0755 deploy/Docker/entrypoint.sh /home/app/entrypoint.sh

# (Tuỳ chọn) Nếu bạn cần Chrome cho Puppeteer, mở khối sau:
RUN apt-get update && \
 apt-get install -y --no-install-recommends \
   ca-certificates wget gnupg \
   libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
   libfontconfig1 libgcc1 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
   libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
   libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
   libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release && \
 install -m 0755 -d /etc/apt/keyrings && \
 wget -qO- https://dl.google.com/linux/linux_signing_key.pub \
   | gpg --dearmor | tee /etc/apt/keyrings/google-linux.gpg > /dev/null && \
 echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-linux.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
   > /etc/apt/sources.list.d/google-chrome.list && \
 apt-get update && apt-get install -y --no-install-recommends google-chrome-stable && \
 rm -rf /var/lib/apt/lists/*

EXPOSE 80
ENTRYPOINT ["/home/app/entrypoint.sh"]
