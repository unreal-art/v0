# Build stage
FROM node:22 AS builder
WORKDIR /app

#COPY package*.json pnpm-lock.yaml ./

COPY . .

COPY .env.example .env


RUN npm install -g bun
RUN bun install


# Deploy stage
FROM node:22-alpine

ENV PORT=3000
ENV NODE_ENV="production"


WORKDIR /app

EXPOSE $PORT

COPY --from=builder /app ./

RUN bun run build
# CMD ["sh", "-c", "npm run test && npm run test:e2e"]

ENTRYPOINT ["npm", "run", "start"]

LABEL maintainer="Hiro <laciferin@gmail.com>"
