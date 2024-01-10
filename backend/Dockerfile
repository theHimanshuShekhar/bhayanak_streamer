FROM node:slim

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

ENV NODE_ENV = production
ENV PORT 3001

EXPOSE 3001

CMD ["npm", "run", "start"]