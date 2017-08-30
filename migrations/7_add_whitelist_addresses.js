var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x23ee1a1c83c2fFf130448c9b22e5AdC081a64EB9',
  '0x7490a97Fa03F981167C7120999d450416b45Da78',
  '0xeac0345659bf6ea3f6f23d13d5ea58cbcdb35cc4',
  '0x9c12487BD8402DFCBe36bB80bbd94e35c8C190C7',
  '0x9Dc0CC658ec1D46820fCFaA5EC6b259fF9d87655',
  '0x7dd1152a81422e30Cff3723A2149f2d1786c1b05',
  '0xd4b3731451de43Ad92166a9866cB90795B6C85be',
  '0xc1B201D8194262af2ac137F7882442869c5183Ac',
  '0xA74607FC0620a4bFA267E603Ca74D57053c439B7',
  '0xd3e2fb831bcdbb8e40cfbeac52236ce6d761844c'
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
