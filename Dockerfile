FROM node:18-alpine

WORKDIR /app

COPY app/package.json app/package-lock.json* ./
RUN npm ci --omit=dev

COPY app/ ./

# Persistent volume for settings.json
VOLUME /app/data

EXPOSE 3000

CMD ["node", "server.js"]
