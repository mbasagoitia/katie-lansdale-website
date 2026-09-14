FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
COPY server.mjs ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.mjs"]
