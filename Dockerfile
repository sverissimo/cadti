FROM node:lts-alpine
# Create app directory
WORKDIR /app

COPY package*.json /app/

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /app/

EXPOSE 80
CMD [ "node", "server.js" ]