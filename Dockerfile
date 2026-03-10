FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-log.txt || (cat /tmp/npm-log.txt && exit 1)
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps --verbose
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
