FROM node:slim

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

ENV PORT = 3000

EXPOSE 3000

CMD ["npm", "run", "start"]