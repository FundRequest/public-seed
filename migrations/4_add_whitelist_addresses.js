var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPublicSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x29b5a95cf205f0c5c8d091b97168aa4b535b402c',
  '0x1dEc45eBAb9C42F08540117D8dC1a29591A73278',
  '0x1843906d36cC93F52B651F0aE78D3b5Ac1c7c5b2',
  '0xd4b3731451de43Ad92166a9866cB90795B6C85be',
  '0x00e3F02d441b2Ad4315874571De3C39bC29918Ae',
  '0x5bf3d049805d22a90adeaf9ab856a27e4d68897b',
  '0xCa4AD3d429Ea5130512b0ebB7fa4A7Fa6D1A0e41',
  '0x5ea28b8b38ff9e669d26a9ba5efa791ff46c56ae',
  '0xCD18Cc759233c53B0C42C00C1d6Bf2F7A40AbDb5',
  '0x140B757A6Fd5C81a73AB90Cd734Dc2D3f100Ca50'
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
