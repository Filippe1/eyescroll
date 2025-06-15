# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# For Pages Router, ensure these are copied if they exist
COPY --from=builder --chown=nextjs:nodejs /app/pages ./pages
COPY --from=builder --chown=nextjs:nodejs /app/pages/api ./api

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]