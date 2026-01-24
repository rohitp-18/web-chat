# Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN chown -R node:node /app

COPY package*.json ./
USER node
RUN npm ci --only=production && npm cache clean --force

ENV PORT=5000

COPY --chown=node:node . .

EXPOSE $PORT

CMD ["npx","tsx", "index.ts"]