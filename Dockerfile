# Use Node.js LTS
FROM node:20-slim

# Set working dir
WORKDIR /usr/src/app

# Copy package.json & lock file first for caching
COPY package*.json ./

# Install deps
RUN npm install 

# Copy rest of source
COPY . .

# Build TypeScript
RUN npm run build

# Run server (compiled JS entrypoint, not TS)
CMD ["node", "build/server.js"]

# Cloud Run listens on $PORT (default 8080)
EXPOSE 8080
