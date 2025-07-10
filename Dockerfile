# Build stage
FROM node:23-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:23-slim AS runner
# Install Nginx
RUN apt-get update && apt-get install -y nginx
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY nginx.conf /etc/nginx/nginx.conf
# Set permissions
RUN chown -R www-data:www-data /app /etc/nginx/nginx.conf
RUN chmod -R 755 /app /etc/nginx/nginx.conf
EXPOSE 80
CMD ["sh", "-c", "npm run start & nginx -g 'daemon off;'"]