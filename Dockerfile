FROM node:10 as dep

COPY package.json package-lock.json ./

RUN npm install --production

FROM node:10
WORKDIR /app
COPY --from=dep /node_modules ./node_modules
EXPOSE 8000
ADD . .
CMD [ "node", "punkt-oppslag-api.js", "--port", "8000", "/data/" ]
