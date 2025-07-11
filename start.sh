#!/bin/sh
# Start Next.js in the background
npm run start &

# Wait for Next.js to be ready (5-10 seconds)
sleep 10

# Start Nginx
nginx -g 'daemon off;'