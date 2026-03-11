FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache libc6-compat
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
