FROM arm64v8/node:14.16 As development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build

# Production
FROM arm64v8/node:14.16-alpine3.13 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

COPY --from=development /usr/src/app/ormconfig.js ./ormconfig.js
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
