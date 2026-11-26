FROM node:22-bookworm-slim AS deps

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown node:node /app

USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY --chown=node:node . .
RUN mkdir -p /app/data
EXPOSE 5173 3001
CMD ["npm", "run", "dev"]

FROM deps AS build
COPY --chown=node:node . .
RUN npm run build

FROM node:22-bookworm-slim AS prod
WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app
USER node
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json tsconfig.server.json ./
COPY --chown=node:node server ./server
COPY --chown=node:node --from=build /app/dist ./dist
ENV NODE_ENV=production
ENV API_PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
