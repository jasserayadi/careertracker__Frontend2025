# Build stage
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-slim AS runner

# Install Nginx with clean up
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./  

# Install production dependencies
RUN npm install --omit=dev

# Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
RUN cp /etc/nginx/mime.types /app/  # Ensure MIME types for static files

# Startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Permissions
RUN chown -R www-data:www-data /app && \
    chmod -R 755 /app && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /var/lib/nginx && \
    chown -R www-data:www-data /etc/nginx

EXPOSE 81
CMD ["/app/start.sh"]