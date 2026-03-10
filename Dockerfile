# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Aceita a chave como build argument
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração para React Router (SPA - evita 404 em rotas diretas)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
