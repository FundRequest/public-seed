var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMathLib = artifacts.require("./math/SafeMath.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMathLib);
  deployer.link(SafeMathLib, FundRequestPrivateSeed);
  deployer.deploy(FundRequestPrivateSeed,
    3575,
    accounts[0]
  );
};