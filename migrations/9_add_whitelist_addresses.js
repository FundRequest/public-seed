var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPrivateSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0x15127666C590532eAC4e376b5eA4dA8975327ACC',
  '0x0006153a82AeD15E59f267a91022579f36aDE09d',
  '0x9fe6434FC55187Fe862d28bb5575E889A918F726',
  '0x63E567cE64C9a63Cc8eB2f87B1BCA00badDC6A00',
  '0x10fd797f3eD5B19Fe0Cb696645F9C0269763Fb13',
  '0x6796C725E16B755A6690806CA9a8f4d8E233b333',
  '0x66E8F875C6840aDEf012320Fb50C7e3264F321ec',
  '0x88635B84349beD796cA29DfAf2DAB18EcBa455AC',
  '0x9111401c5a6B84F4E3d337F0b584c27011a02AB1',
  '0xCeb66167291ecD9663be5BE144Be928b2D7C8d07'
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
