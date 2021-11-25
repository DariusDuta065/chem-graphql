FROM node:14.16-alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install
# RUN npm i --only=development

COPY . .

RUN npm run build

# Production
FROM node:14.16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --prod
# RUN npm ci --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
