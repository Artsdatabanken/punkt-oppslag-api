FROM node:21-slim as dep

COPY package.json package-lock.json ./

RUN npm install --production

FROM node:21-slim
RUN groupadd -r --gid 1007 dockerrunner && useradd -r -g dockerrunner dockerrunner
WORKDIR /app
COPY --from=dep /node_modules ./node_modules
EXPOSE 8000
ADD . .
USER dockerrunner
CMD [ "node", "punkt-oppslag-api.js", "--port", "8000", "/data/" ]
