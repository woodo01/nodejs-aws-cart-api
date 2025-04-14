# Dependencies stage
FROM node:20-alpine AS dependencies
WORKDIR /app
# Copy only package files
COPY package*.json ./
# Install all dependencies
RUN npm ci && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY tsconfig*.json ./
COPY src/ ./src/
COPY --from=dependencies /app/package.json ./
COPY --from=dependencies /app/node_modules ./node_modules
# Build app
RUN npm run build
# Remove dev dependencies
RUN npm prune --omit=dev

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Only package.json for prod
COPY package.json ./
# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/main"]