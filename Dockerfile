FROM node:18-alpine
WORKDIR /usr/src/app

# 1) Instala tudo (prod + dev)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 2) Copia o restante e faz o build
COPY . .
RUN npm run build

# 3) Serve com preview
EXPOSE 4173
CMD ["npm", "run", "preview"]
