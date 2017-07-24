var Presale = artifacts.require("./presale/Presale.sol");

contract('Presale', function (accounts) {
  it("it should have the name DIPLR", function () {
    return CrowdsaleToken.deployed().then(function (instance) {
      return instance.rate.call();
    }).then(function (_rate) {
      assert.equal(_rate.valueOf(), 3575, "Rate was not correct");
    });
  });
});