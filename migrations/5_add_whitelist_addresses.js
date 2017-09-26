var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPublicSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x1843906d36cC93F52B651F0aE78D3b5Ac1c7c5b2',
  '0xF8AC2aEB4183d05f751842c9305cF331CA9B5153',
  '0x0092ef3AeCFE94893970e07339121Aa51820B4E4',
  '0xcF4338A39f0f5D97e9e5EA6Fc2A6305B2F3AdD2f',
  '0x0f53d88A2F92c248aB768a90e17C1F2Fa09C01d0',
  '0x00e3F02d441b2Ad4315874571De3C39bC29918Ae',
  '0xA0Bc835e1398DF76fA14B321ED3Fc037A4F5f88B',
  '0x7eB1e9267Ab19cefE7Dc068Be6c8f9dE42b0d85E',
  '0xe93d33cf8aaf56c64d23b5b248919eabd8c3c41e',
  '0x007BFe6994536Ec9e89505c7De8e9EB748d3CB27'
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
