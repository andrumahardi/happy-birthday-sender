
FROM node:14-alpine
RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN yarn install

EXPOSE 3300

CMD ["yarn", "listen:dev"]