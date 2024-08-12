# nodejs-aws-cart-api

## Installation

```bash
npm install
```

Put content of env.example to .env and update credentials
```bash
cat env.example > .env
```


## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

To create user and get basic auth token via cli run
```bash
./get-token.sh
```
if command doesn't work run before
```bash
chmod +x ./get-token.sh
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
