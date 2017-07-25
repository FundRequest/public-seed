var Presale = artifacts.require("./presale/Presale.sol");

contract('Presale', function (accounts) {
  it("it should have the correct rate", function () {
    return Presale.deployed().then(function (instance) {
      return instance.rate.call();
    }).then(function (_rate) {
      assert.equal(_rate.valueOf(), 3575, "Rate was not correct");
    });
  });

   it("it should have 0 backers to start", function () {
    return Presale.deployed().then(function (instance) {
      return instance.investorCount.call();
    }).then(function (_ic) {
      assert.equal(_ic.valueOf(), 0, "investorcount was not correct");
    });
  });

   it("it should have 0 wei to start", function () {
    return Presale.deployed().then(function (instance) {
      return instance.weiRaised.call();
    }).then(function (weiRaised) {
      assert.equal(weiRaised.valueOf(), 0, "weiRaised was not correct");
    });
  });
});