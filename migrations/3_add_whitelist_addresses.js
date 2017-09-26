var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPublicSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x35df75EE381767e5e2A82989baB88fB010464641',
  '0x00f37E65859f5Df7e9567595A3f85CEd116B3f2a',
  '0x05badd9D74dCaC1bfe7d827A6FF009cef5e2f4F1',
  '0x00cA3751c6C3171008ee7f4DF65039B95Aa1bfB2',
  '0x23ee1a1c83c2fFf130448c9b22e5AdC081a64EB9',
  '0x00D72d2ea861252aD59F25873195B1bA03402207',
  '0xd03e3F3E9F224C229148918E9A4215b2C0C8C4Da',
  '0x004acD97fa4ce10a5e5E67B972C810becd27b14E',
  '0x5F24562227aD2a15072bE90128ac8328231C3791',
  '0x0048BdCc0c9E2f61b0b3EA08df08E5A98AB4FF47'
];

module.exports = function (deployer, network, accounts) {
  deployer.then(function () {
    FundRequestPrivateSeed.deployed().then(function (instance) {
      whitelistedAddresses.forEach(function (a) {
        instance.allow(
          a, {from: accounts[0]}
        ).then(function () {
          console.log('Account submitted to the whitelist: ' + a);
        }).catch(function (err) {
          console.error('Whitelisting failed for: ' + a);
        });
      });

    });
  });
};
