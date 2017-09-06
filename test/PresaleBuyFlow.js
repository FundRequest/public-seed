var Presale = artifacts.require("FundRequestPrivateSeed");

contract('FundRequestPrivateSeed', function(accounts) {
    it("it should not be possible to buy without allowing first", function() {
        var presale;

        return Presale.deployed().then(function(instance) {
            presale = instance;
            return instance.buyTokens(accounts[0], {
                from: accounts[0],
                value: web3.toWei(25)
            });
        }).catch(function(result) {
            return presale.investorCount();
        }).then(function(investorCount) {
            assert.equal(investorCount, 0, "investorCount shouldn't have been updated");
        });
    });

    it("it should be possible to buy once allowed", function() {
        var presale;

        return Presale.deployed().then(function(instance) {
            presale = instance;
            return presale.allow(accounts[0], {
                from: accounts[0]
            });
        }).then(function() {
            return presale.buyTokens(accounts[0], {
                from: accounts[0],
                value: web3.toWei(25) // min 25 ETH
            });
        }).then(function() {
            return presale.investorCount.call();
        }).then(function(investorCount) {
            assert.equal(investorCount, 1, "investorCount is not increased with 1");
        }).catch(function(error) {
            assert(false, error.message);
        });
    });

    it("total wei raised is correct after buying", function() {
        var presale;
        return Presale.new(3575, accounts[0])
            .then(function(instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function() {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(25) // min 25
                });
            })
            .then(function() {
                return presale.weiRaised.call();
            })
            .then(function(weiRaised) {
                assert.equal(weiRaised.toNumber(), web3.toWei(25), "total wei raised was not correct");
            }).catch(function(error) {
                assert(false, error.message);
            });
    });

    it("assigned tokens are correct after buying", function() {
        var presale;
        var rate = 3575;
        var buyin = 32;
        return Presale.new(3575, accounts[0])
            .then(function(instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function() {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(buyin)
                });
            })
            .then(function() {
                return presale.balanceOf(accounts[0]);
            })
            .then(function(bal) {
                assert.equal(bal.toNumber(), web3.toWei(buyin * rate), "balance was not correct after buying");
            });
    });

    it("deposits are correct after buying", function() {
        var presale;
        var rate = 3575;
        var buyin = 32;
        return Presale.new(3575, accounts[0])
            .then(function(instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function() {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(buyin)
                });
            })
            .then(function() {
                return presale.depositsOf(accounts[0]);
            })
            .then(function(bal) {
                assert.equal(bal.toNumber(), web3.toWei(buyin), "balance was not correct after buying");
            });
    });
});