# FEE's Backend

The backend for [fee](https://fee.fr/) ([api.fee.fr](https://api.fee.fr/)).

The main goals of this backend is to provide:

- A connection to our MongoDB database via Mongoose models.
- An authentication service for the FEE's frontend.
- A Stripe payment process handler for processing subscription.
- A GraphQL endpoint powered by Apollo's graphql-tools serving services of the frontend ([api.fee.fr/graphql](https://api.fee.fr/graphql)).

## Installation

### IDE

You need to use VSCode. With [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) plugins installed. You may need to restart VSCode.

### System Dependencies

#### Node.js

You need a **recent** Node.js version (v16.14+).

You should use [nvm](https://github.com/creationix/nvm).

#### Environment variables

Add a .env file at the root of the project.
You need to fill :
    - APP_PORT
    - DATABASE_MONGODB_HOST

### Node Dependencies

Dependencies resolved via npm:

```shell
npm install
```

#### Runtime Dependencies

Those dependencies are needed for this application to **run**.

Here are the most important ones you should know about:

<a id="typescript" />

##### [Typescript](https://www.typescriptlang.org/)

Our main language. Permits to have the power of JS features in a type-based language so as to compiled it and avoid erros during the runtime.

**Understanding TypeScript is key to master this codebase**

<a id="node" />

##### [`node`](https://nodejs.org/en/docs/)

JavaScript runtime built on Chrome's V8 JavaScript engine.

<a id="nest" />

##### [`nest`](https://docs.nestjs.com/)

Node.js framework for building efficient, reliable and scalable server-side applications. Under the hood it uses [Express](https://expressjs.com/).

**Understanding Nest is key to master this codebase**

##### [`apollo-server`](https://www.apollographql.com/docs/apollo-server/getting-started/)

Builds a production-ready, self-documenting GraphQL API that can use data from any source. See also the [GraphQL's doc](http://graphql.org) for more details.

**Understanding Apollo is key to master this codebase**

##### [`mongoose`](https://www.npmjs.com/package/mongoose)

Our ODM to connect to our MongoDB. Mongoose is an intustry-standard.

#### Development Dependencies

Those dependencies are used for helping with the development:

##### [`eslint`](https://www.npmjs.com/package/eslint)

Code linter.

## Configuration

- **The .env.development file** - `.env.development.local` - Describes the env variables used in development environment.
- **The .env.production file** - `.env.production.local` - Describes the env variables used in production environment.
- **The config file** - `src/utils/config.js` - Creates a config data structure which can be accessed thoughout the application.

## Run

The application has two running modes:

### Dev runner

```shell
npm start
```

[Nest](#nest) will automatically load .env.development and set NODE_ENV='DEVELOPMENT'. It then listens on `3030`.

### Prod build runner

```
npm run build
```

[Nest](#nest) will automatically load .env.production and set NODE_ENV='PRODUCTION'.

Then, start the server:
```
npm start
```

## Contributing

In order to help you contribute to the repository, we provide you two main
tools:

- **Testing** via `npm test`
- **Typechecking** via `npm run typecheck`
- **Linting + Typechecking on all files** via `npm run lint-all`
- **Linting + Typechecking on staged files** via `npm run lint`

### Rules

You can't commit directly on `master`, you should fill Pull Request via Github.

Those must respond to the checklist provided in the template.

### Reporting issues

You are welcome to [report backend issues here](https://github.com/L8RMedia/api.thedesktop.io/issues/new)!

Follow the template and everything should roll well!

## Repository structure

Here is the repository structure ([here](https://github.com/nestjs/graphql/issues/1365) is the inspiration):