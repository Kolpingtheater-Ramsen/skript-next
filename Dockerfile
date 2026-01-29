# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time arguments for environment variables
ARG NEXT_PUBLIC_SOCKET_URL
ARG FLASK_BACKEND_URL

# Set environment variables for build
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
ENV FLASK_BACKEND_URL=${FLASK_BACKEND_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Runtime environment variables (can be overridden at runtime)
ENV FLASK_BACKEND_URL=http://skript-backend:5000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
