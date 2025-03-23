FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm ci

# Copy all frontend source files
COPY public ./public
COPY src ./src
COPY tsconfig.json .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built files from build stage
COPY --from=build /app/build .

# Copy nginx configuration and entrypoint script
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

# Environment variable for API URL (can be overridden at runtime)
ENV REACT_APP_API_URL=http://tfabackend-production.up.railway.app/api

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 