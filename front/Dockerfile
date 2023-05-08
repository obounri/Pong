FROM node

# setting the current work directory to /app , will be created if not there.
WORKDIR /app

COPY ./package*.json ./
# copy the contents of the current directory (next app) to /app inside the container
COPY . .

RUN npm install


EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]