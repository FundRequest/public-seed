var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x5AEb9907e976eEbb120427829c0b23d48B21d8B0',
  '0x51760485687ea92C837c0191f59a99D91b0F6bbD',
  '0x1f18dec454ecd9fc1c37e512c4acb65e0542adc6',
  '0xF0018e3FBE646a51520B5b418F1140869dDaabe7',
  '0x0024d5549BF5C3aCa24f1CEAeCF50f50C9D92bD7',
  '0x72E1b6e5442c9a2B512c1D900FC8969BDDf1DEaC',
  '0x61e0ace2c74e64e0b8cb5bbce0cf657a17b15798',
  '0xd6B6b756B6A8969F1FEedC958dee51537E1b7AC7',
  '0xb8C3fFEDAC9Df9D0C52b9a2179844F78b0A3c54B',
  '0xebD42B6a487c4FeD4F9660C19291295d8eD14F7e'
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
