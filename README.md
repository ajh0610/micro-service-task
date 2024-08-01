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

## Node JS Version
```
NodeJS: v21.1.0

NPM: v10.2.0
```
## Postgres Version
```
Postgres: v16.2
```
## Redis Verison
```
Redis-Cli 7.0.8
```
## Project Setup

1. Clone the repository,
2. Create a .env file in each folder to configure environment variables. Use .env.example as reference,
3. Open each microserice in different termianl,
4. Run npm install,
5. After installing all necessary packages run node index in all the termianls to run all the microserivces.


