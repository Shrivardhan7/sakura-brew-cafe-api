# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sakura -u 1001

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=sakura:nodejs . .

# Use the non-root user
USER sakura

# Expose application port
EXPOSE 5000

# Health check — Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "src/server.js"]
