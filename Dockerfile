FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache libc6-compat
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
