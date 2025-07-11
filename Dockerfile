# Build stage
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-slim AS runner
# Install Nginx and clean up apt cache
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy Nginx config and ensure mime.types is available
COPY nginx.conf /etc/nginx/nginx.conf
RUN cp /etc/nginx/mime.types /app/mime.types

# Copy the startup script
COPY start.sh /app/start.sh

# Set permissions
RUN chown -R www-data:www-data /app && \
    chmod -R 755 /app && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /var/lib/nginx && \
    chown -R www-data:www-data /etc/nginx && \
    chmod +x /app/start.sh

EXPOSE 81
CMD ["/app/start.sh"]