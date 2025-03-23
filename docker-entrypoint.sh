#!/bin/sh

# Replace environment variables in the nginx configuration
envsubst '${REACT_APP_API_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Replace environment variables in the React app
# Find all JS files in the build directory
find /usr/share/nginx/html -type f -name "*.js" | while read file; do
  # Replace placeholder with actual value
  sed -i "s|REACT_APP_API_URL_PLACEHOLDER|${REACT_APP_API_URL}|g" $file
done

# Execute the CMD
exec "$@" 