var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0xee154bf7C2F2Db7Ab2d096a00571E01494d7fEE1',
  '0xfb2c9ef51b78c2bba2492f00a90144fd815a47b9',
  '0xEAC8483261078517528DE64956dBD405f631265c',
  '0xf94571dbdFf33446DAbD17040Cd6236B0D2C2545',
  '0xeEFCd01087281D035ecE6A3BC369EB3afAfC4CEC',
  '0xAfa9bD8dd630aA75Da37D6dEC2cDc998A8c34792',
  '0x3F076584fE16eFAdfE36458b15FFAa8d31F1555A',
  '0x67D9057494e2E1B7361251043843Db3c2ABF8177',
  '0x7698301937ba8863F781d2bEc85cDF36Fb7E5759',
  '0x8fdc09cb4b096aabafabab8b62a54ebecd76bc9f'
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
