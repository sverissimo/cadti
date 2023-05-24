FROM node:18
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
CMD [ "npm", "run", "server" ]
EXPOSE 3002