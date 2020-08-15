FROM node:10

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN node_modules/.bin/tsc --build tsconfig.json

ENTRYPOINT ["node", "lib/main.js"]
