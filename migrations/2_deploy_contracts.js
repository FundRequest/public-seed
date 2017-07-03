var SafeMath = artifacts.require("./math/SafeMath.sol")
var Presale = artifacts.require("./Presale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SafeMath);
  deployer.link(Ownable, Presale);
  if (network != "live" && network != "ropsten") {
    deployer.deploy(Presale, 
    0, 
    250,
    )
    deployer.deploy(FundRequestPreSale,
      "0",
      "250",
      "0,00032",
      "0xe5a0aca19ca6326aa52ea8cdc795602d0675d5f1f106788e8dddfbdf7cf548d0");
  }
};
