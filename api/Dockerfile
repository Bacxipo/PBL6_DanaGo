# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-maxtimeout 120000 && pnpm config set fetch-timeout 300000

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --config.ignore-scripts=true

COPY . .
RUN pnpm run build

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

RUN npm install -g pnpm
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-maxtimeout 120000 && pnpm config set fetch-timeout 300000

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --config.ignore-scripts=true

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/main"]
