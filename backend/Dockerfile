FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Expose port (Heroku uses $PORT)
EXPOSE $PORT

# Start production server
CMD ["node", "dist/index.js"]
