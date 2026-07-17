FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system migrateos && adduser --system --ingroup migrateos migrateos
COPY --from=build --chown=migrateos:migrateos /app/public ./public
COPY --from=build --chown=migrateos:migrateos /app/.next/standalone ./
COPY --from=build --chown=migrateos:migrateos /app/.next/static ./.next/static
USER migrateos
EXPOSE 3000
CMD ["node", "server.js"]
