FROM node:14.15.0-alpine

LABEL maintainer="Parinaz mohamadianraouf"

WORKDIR /home/node/app

COPY package*.json ./

RUN apk update \
	&& apk add --no-cache --virtual .build-deps make gcc g++ python

RUN npm install \
	&& npm audit fix \
	&& chown -R node:node /home/node/app

COPY --chown=node:node . .

USER node

EXPOSE 8080

CMD npm run dev
