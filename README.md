## Project Overview

The project is having 4 folders each having a microservice. The microservices are namely 
  1. API-Gateway Service: This acts as the entry point to all the request to the project.
  2. User Service: This is having all the endpoints required for user login and signup.
  3. Task Service: This is having all the endpoints for the tasks, Create, Update, Delete and List.
  4. Notification Serivce: This is used to send user notification once the user create, updates or deletes the tasks.
  
```
project-root/
├── api-gateway/
├── user-service/
├── task-service/
└── notification-service/
```

## Docker Version
```
v25.0.2

```

## Docker Compose Version
```
v2.24.5

```

## Project Setup

1. Clone the repository,
2. Install the docker and docker compose if not already,
3. The project folders have .env.example in each of the microservice create .env based on the example and add your credentials, 
4. Keep the port mapping same if changed in .env files then keep in mind to change it in docker compose file,
5. Run docker compose build and docker compose run in the root directory to start the project.


## Important 


The project uses redis and postgres. If there are instances running in your machine on the ports 5432 for postgres and 6379 for redis there will be issue of coliding ports. Either change all the ports in port mapping in docker compose file and .env files or disable these service in your local machine.



## Docker Commands

```
docker compose build
docker compose up
docker compose down -v

```
