# Use Node.js 20 LTS slim
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies including devDependencies (needed for tsc)
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build

# Use a lightweight image for running (optional)
# You can skip this step and just run in node:20-slim
# FROM node:20-slim
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --omit=dev
# COPY --from=0 /usr/src/app/build ./build

# Start server from compiled JS
CMD ["node", "build/server.js"]

# Cloud Run expects this port
ENV PORT 8080
EXPOSE 8080
