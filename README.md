# Fundrequest Private Presale

This repository contains the code for the private presale, where we will guarantee a select few the ability to be in the presale.

## Prerequisites
* Have a Geth client or a TestRPC running, default the contract will be deployed to localhost:8545
* Truffle version 3.2.5 is used
* npm version 3.10.10 is used
* Have an access token for infura (https://infura.io) and put the token in ./config/secrets/infura-token.js

## Usage

To build and run the code run the following commands inside the cloned repo.

* compile contracts (do everytime a contract changes)
```
truffle compile
```
* add contracts to local TestRPC (do everytime a new TestRPC is set up or when contracts changed)
```
truffle migrate
```
* build the website in the ./build folder
```
gulp build
```
* run app (on http://localhost:8080)
```
truffle serve
```

## Distribution

To build the app to the ./dist folder:
```
gulp dist
```

