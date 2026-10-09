FROM node:22-alpine AS client-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client ./client
RUN npm run build --prefix client

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix server
COPY server ./server
COPY --from=client-build /app/client/dist ./client/dist
USER node
EXPOSE 5000
EXPOSE 9464
CMD ["node", "server/src/server.js"]
