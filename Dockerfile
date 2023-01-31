FROM node:12

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

EXPOSE 3001

#WORKDIR /app/client
#RUN npm install
#RUN npm build

CMD [ "npm", "run", "server" ]