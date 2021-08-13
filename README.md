# React/Express Template
This is a template for apps using react, express, scss, tailwind, ejs, mongoose, and typescript.

## Getting Started
### Configuration
configure nodemon-sample.json with your enviroment variables and rename it to nodemon.json. 

configure /config/config-sample.json with your domain names and rename the file as config.json and then copy it to client/src/config directory

### Commands

To build the scss and tailwind for the front end use a terminal to change into the client directory and run "npm run build-css"

Install dependencies by running "npm i -D" in both the root and the client folder

To develop the application run "npm run test" in the root directory

Bellow are descriptions for the "npm run" commands. 

| Folder | Command | Description |
| --- | --- | --- |
| root | lint | Runs the Typescript linter |
| root | build | Builds the nodejs typescript |
| root | start | Once the nodejs typescript is built you can run it with this command |
| root | client | Runs the client start command from the root folder |
| root | server | Runs the nodejs app in development mode providing live changes |
| root | server:debug | Runs the nodejs app in debug mode |
| root | test | Runs both the react app and the nodejs app in development mode |
| client | build-scss | Builds the index.scss file as style.css |
| client | build-css | Runs the build-scss command and builds tailwind |
| client | start | Starts the react app in development mode |
| client | build | Builds the react app for use in production |
| client | test | Runs App.test to test the application for bugs |
| client | eject | Ejects the react app from the framework, THIS CANNOT BE UNDONE! |

## Finishing Up
### Docker
Once you are done designing your program you can dockerize it with the included Dockerfile, some changes to the file may be necessary.

To build the container run "docker build -t imageTag .".

Mountable volume for config is "/app/config".

When running the docker container make sure to set the enviroment variables that are set in nodemon.json.

The docker container will run both the react app and node app on port 80 by default this can be override with the environment variable PORT.

```bash
docker run --name value -p 80:80 -e DB_USERNAME=value -e DB_PASSWORD=value -e DB_AUTHSOURCE=admin -e DB_IP=value -e DB_PORT=27017 -e DB_COLLECTION=value -e SECRET=value -v VolPath:/app/config imageTag
```

## Warning
Do not make changes in the dist or the client/build folders. They will be overriden when the applications are rebuilt!