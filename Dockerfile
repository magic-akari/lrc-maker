FROM node:lts AS builder

WORKDIR /app
COPY . .
RUN corepack enable
RUN pnpm install --frozen-lockfile --strict-peer-dependencies
RUN pnpm run build

# the final image, only need to serve the static files
FROM nginx:alpine

RUN apk update && apk upgrade
COPY --from=builder /app/build /usr/share/nginx/html
