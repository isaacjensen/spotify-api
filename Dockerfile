FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install morgan
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "npm", "start" ]