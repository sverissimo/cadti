FROM node:12

WORKDIR /client

COPY package*.json /client/

EXPOSE 3000

RUN npm --version
RUN npm install

CMD [ "npm", "run", "client" ]

#COPY . /client/
#RUN npm build