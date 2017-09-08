var FundRequestPublicSeed = artifacts.require("FundRequestPublicSeed");
var SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundRequestPublicSeed);
  deployer.deploy(FundRequestPublicSeed,
    3600,
    accounts[0]
  );
};