FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client ./client
RUN npm run build --prefix client

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY k8s/frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 8080
