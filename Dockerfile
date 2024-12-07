FROM node:21-alpine3.20 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN npm install -g pnpm
RUN pnpm run build

FROM busybox:1.30 AS runner
WORKDIR /app
COPY --from=builder /app/dist .
CMD ["busybox", "httpd", "-f", "-v", "-p", "8080"]
