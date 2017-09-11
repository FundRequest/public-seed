var FundRequestPublicSeed = artifacts.require("FundRequestPublicSeed");
var SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundRequestPublicSeed);
  deployer.deploy(FundRequestPublicSeed,
    3600,
    30, //300.000 / 300USD = 1000 ETH
    accounts[0]
  );
};