FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

ENV MONGOMS_DISABLE_POSTINSTALL=1
RUN npm ci

COPY . .

RUN npm run build


FROM node:24 AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/src/server.js"]
