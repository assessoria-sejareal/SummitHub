FROM node:20-slim

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["npm", "start"]