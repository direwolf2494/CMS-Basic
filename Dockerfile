FROM node:16-alpine3.11
WORKDIR /usr/src/app
RUN npm install -g nodemon typeorm tsc tsc-watch
