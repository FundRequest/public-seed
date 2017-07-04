var SafeMath = artifacts.require("./math/SafeMathLib.sol");
var Ownable = artifacts.require("./zeppelin/Ownable.sol");
var Haltable = artifacts.require("./zeppelin/Haltable.sol");
var Presale = artifacts.require("./Presale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Ownable);
  deployer.link(Ownable, Haltable);
  deployer.deploy(Haltable);
  deployer.link(Haltable, Presale);  
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Presale);
  if (network != "live" && network != "ropsten") {
    deployer.deploy(Presale,
      "100",
      "200",
      "1",
      "0xe5a0aca19ca6326aa52ea8cdc795602d0675d5f1f106788e8dddfbdf7cf548d0");
  }
};
