FROM node:12
WORKDIR /cadti/client
COPY ./package.json ./package-lock.json ./
RUN npm ci
EXPOSE 3000
CMD [ "npm", "run", "start" ]
