FROM node:16-alpine AS builder

RUN apk add make rsync git

WORKDIR /app
COPY . .
RUN npm install --quiet
RUN npm run build

# the final image, only need to serve the static files
FROM flashspys/nginx-static

RUN apk update && apk upgrade
COPY --from=builder /app/build /static
