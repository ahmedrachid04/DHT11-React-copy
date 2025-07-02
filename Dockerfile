FROM node:21-alpine3.20 AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ENV VITE_BACKEND_URL=http://localhost:5000
RUN pnpm run build

FROM nginx:1.25.4-alpine3.18
COPY --from=builder /app/dist /var/www/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]