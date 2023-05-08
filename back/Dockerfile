FROM node

# setting the current work directory to /app , will be created if not there.
RUN npm install -g @nestjs/cli

WORKDIR /app

COPY ./package*.json ./

COPY . .

RUN npm install

# copy the contents of the current directory (Nest app) to /app inside the container

EXPOSE 3300

ENTRYPOINT [ "npm", "run", "start:dev" ]

