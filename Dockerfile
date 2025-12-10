# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install bash for debugging
RUN apk add --no-cache bash

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy migration files and scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts

# Heroku sets PORT environment variable dynamically
ENV NODE_ENV=production

# Expose port (Heroku will set $PORT)
EXPOSE $PORT

# Start production server
CMD ["npm", "start"]
