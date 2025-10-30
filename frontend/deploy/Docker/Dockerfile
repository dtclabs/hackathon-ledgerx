# ---------- Builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Dùng Yarn 4 (nếu bạn dùng npm thì đổi lệnh tương ứng)
RUN corepack enable && corepack prepare yarn@4.2.2 --activate

# Cache deps
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --immutable

# Copy source và build Next
COPY frontend/ .
# (Tùy chọn) Tắt telemetry
ENV NEXT_TELEMETRY_DISABLED=1
# Nếu có thể, bật standalone để runtime nhẹ (thêm "output":"standalone" trong next.config.js)
RUN yarn build

# ---------- Runtime ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Cổng Next
ENV PORT=3000

# Nếu bạn đã bật "output: standalone", copy tối thiểu:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/static ./.next/static

# Nếu CHƯA bật standalone, copy toàn bộ (an toàn hơn, image nặng hơn):
COPY --from=builder /app ./

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
