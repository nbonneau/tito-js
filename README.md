# Tito-js

## Install

1. Install nvm

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Dont forget to restart terminal after install nvm

2. Install node & npm

```bash
nvm install node
```

3. Clone repository

```bash
git clone https://github.com/nbonneau/tito-js.git
```

4. Install packages

```bash
cd \<project_folder\> && npm install
```

## Start app

__Production env__
To start app on prod environment, juste set `NODE_ENV` to `production`:

```bash
export NODE_ENV=production
```

__Each env__

Start app

From project folder

```bash
npm start
```

Go to [http://localhost:3000](http://localhost:3000)

## App configuration

Config files are in `config` folder.

The application loads the configuration from JSON files and uses the environment variable `NODE_ENV` to retrieve the correct file. The default configuration is in the default.json file. It is possible to define a file by environment as follows: development.json. In this case, the environment file will override the default.json file.

App port is set to `server.port` but it is possible to override it using `NODE_PORT` variable.
By default it is set to 3000

## Debug

To debug app just use DEBUG when you start your app:

```bash
DEBUG=tito-js:* npm start
```