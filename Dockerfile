# Base image includes Java and Node
FROM timbru31/java-node:latest

# Specify working directory
WORKDIR /docker

# Add application code

# Copy dependency metadata
COPY ./package.json /docker/package.json
COPY ./package-lock.json /docker/package-lock.json

# Copy backend and frontend
COPY ./backend /docker/backend
COPY ./frontend /docker/frontend

# Install dependencies and build Vue
RUN npm install --unsafe-perm
RUN npm run deploy

# Expose Express port
EXPOSE 3001

# Start the server
CMD npm start
