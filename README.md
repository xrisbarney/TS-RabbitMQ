﻿# TS-RabbitMQ

## Description

This repository contains the code to publish events to a message broker.

## Documentation


### API endpoints
The message-broker postman collection contains all the API endpoints and how to run them. In order to use it, launch Postman and import it as a collection.

### Setting up the message broker
The message broker used in this application is RabbitMQ. It was run from a docker container. To create your RabbitMQ instance using the docker container, follow the steps below:
- Navigate to the directory `broker` in this repository. 
- Move the file `docker-compose.yml` to the directory where you want to run the DB container from. Ensure that docker and docker-compose is installed on the computer you want to run the computer on.
- Update the container with your preferred credentials for the following variables:
  ```
  RABBITMQ_DEFAULT_PASS
  RABBITMQ_DEFAULT_USER
  ```
- Run the docker compose file in detached mode
  ```
  docker-compose up -d
  ```

### Setting up the Node application
<i>It is assumed you have nodejs already installed</i>

In order to run the node application follow the steps below:

- Clone the repository.
  ```
  git clone https://github.com/xrisbarney/TS-RabbitMQ.git
  ```
- Enter the cloned directory
- Install the application dependencies.
  ```
  npm install
  ```
- Create a .env file in the root directory of the cloned application. Then add the the content below:
  ```
  PORT="3001"
  RABBITMQ_USER="<rabbitmq_username>"
  RABBITMQ_HOST="<rabbitmq_host>"
  RABBITMQ_PASSWORD="<rabbitmq_pass>"
  RABBITMQ_SUBSCRIBER_PORT="5672"
  RABBITMQ_INTERFACE_PORT="15672"
  RABBITMQ_URL="amqp://<rabbitmq_username>:<rabbitmq_pass>@<rabbitmq_host>:5672"
  ```
Ensure you replace all variables in <> with their proper values.
- Start the application by running the command below:
  ```
  npm start
  ```
- Make a request to the endpoint `/api/compute-invites` with the file and the company location,  then  watch the console for the event invite emmitted.

- The endpoint and its documentation in the message-broker postman collection.
