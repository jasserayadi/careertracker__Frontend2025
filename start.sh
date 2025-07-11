#!/bin/sh

# Start Next.js in the background
npm run start &

# Wait for Next.js to be ready (adjust the sleep time if needed)
sleep 10

# Start Nginx in the foreground
nginx -g 'daemon off;'