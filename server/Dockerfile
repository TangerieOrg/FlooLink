FROM --platform=$BUILDPLATFORM docker.tangerie.xyz/node-docker

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 80

ENTRYPOINT ["npm", "start"]