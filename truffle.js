fs = require('fs')

var HDWalletProvider = require("truffle-hdwallet-provider");

var getMnemonic = function (env) {
  try {
    var mnemonic = fs.readFileSync('./config/' + env + '/mnemonic').toString()
    console.log("using predefined mnemonic for network " + env);
    return mnemonic;
  } catch (exception) {
    return "diplr"
  }
}

var getSecret = function () {
  try {
    return fs.readFileSync('./config/secret/infura-token.js').toString();
  } catch (ex) {
    return "";
  }
}

module.exports = {

  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    local: {
      provider: new HDWalletProvider(getMnemonic('local'), "http://localhost:8545/"),
      network_id: '*',
    },
    kovan: {
      network_id: '42',
      provider: new HDWalletProvider(getMnemonic('kovan'), "https://kovan.infura.io/" + getSecret())
    },
    ropsten: {
      network_id: '3',
      provider: new HDWalletProvider(getMnemonic('ropsten'), "https://ropsten.infura.io/" + getSecret())
    },
    rinkeby: {
      network_id: '4',
      provider: new HDWalletProvider(getMnemonic('rinkeby'), "https://rinkeby.infura.io/" + getSecret())
    }
  },
};