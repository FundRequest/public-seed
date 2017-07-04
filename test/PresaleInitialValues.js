var FundRequestPreSale =  artifacts.require("./Presale.sol");
contract('FundRequestPreSale', function(accounts) {
  it("should have a startblock of 0", function() {
    return FundRequestPreSale.deployed().then(function(instance) {
       return instance.startBlock.call();
    }).then(function(block){
        assert.equal(block.valueOf(), 100, "100 was not the start block")
    });
   });
    it("should have an endBlock of 250", function() {
        return FundRequestPreSale.deployed().then(function(instance) {
        return instance.endBlock.call();
    }).then(function(block){
            assert.equal(block.valueOf(), 200, "200 was not the the end block")
        });
    });

    it("should not be halted at startup", function() {
        return FundRequestPreSale.deployed().then(function(instance) {
        return instance.halted.call();
    }).then(function(halted){
            assert.equal(halted.valueOf(), false, "it was halted at startup");
        });
    });
});