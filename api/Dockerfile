# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

RUN npm install -g pnpm
RUN pnpm config set fetch-retries 5 && pnpm config set fetch-retry-maxtimeout 120000 && pnpm config set fetch-timeout 300000

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --config.ignore-scripts=true

COPY . .
RUN npx prisma generate
RUN pnpm run build

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

RUN apk add --no-cache openssl libc6-compat

COPY package.json ./
# Lấy node_modules từ builder: pnpm để Prisma Client đã generate trong node_modules/.pnpm/...,
# không có ở node_modules/.prisma nên không thể copy riêng thư mục đó.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/main"]
