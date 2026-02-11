FROM node:22-slim AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
CMD ["npx", "vite", "--host"]

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
