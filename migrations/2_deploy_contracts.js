var Presale = artifacts.require("./presale/Presale.sol");
var SafeMathLib = artifacts.require("./math/SafeMathLib.sol");


module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMathLib);
  deployer.link(SafeMathLib, Presale);
  deployer.deploy(Presale,
    3575,
    accounts[0]
  );
};