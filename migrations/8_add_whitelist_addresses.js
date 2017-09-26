var FundRequestPrivateSeed = artifacts.require("./presale/FundRequestPublicSeed.sol");
var SafeMath = artifacts.require("./math/SafeMath.sol");

var whitelistedAddresses = [
  '0xa3c97e947e17e2261ec0507a80e317473aad1d7f',
  '0x35df75EE381767e5e2A82989baB88fB010464641',
  '0x006Bbe82B523a92D806978e7369B771e26541C00',
  '0x0d6401F493ED30b79B834152f524370379B74306',
  '0xd36eA428FF8796f94Aec58A063500023525A1201',
  '0x9dBCAac6305f4284b54f42Db3C6A5fb6B007FA13',
  '0x72AED3D59cC889B8ab5d943C703f45C4aeaeBf86',
  '0xfC452c57afBA7b7C7972f9F515a26E0B1Bd1B70f',
  '0xebD42B6a487c4FeD4F9660C19291295d8eD14F7e',
  '0xD6Bb63da2B15917B6cb97bda11b26c5fa47fF7b8'
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
