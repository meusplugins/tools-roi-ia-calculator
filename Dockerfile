FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps --verbose
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
