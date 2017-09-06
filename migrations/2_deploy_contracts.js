var FundRequestPrivateSeed = artifacts.require("FundRequestPrivateSeed");
var SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, FundRequestPrivateSeed);
  deployer.deploy(FundRequestPrivateSeed,
    4500,
    accounts[0]
  );
};