var Presale = artifacts.require("./presale/Presale.sol");

contract('Presale', function (accounts) {
    it("it should not be possible to buy without allowing first", function () {
        var presale;
        return Presale.deployed().then(function (instance) {
            presale = instance;
            return instance.buyTokens(accounts[0], {
                from: accounts[0],
                value: web3.toWei(1)
            });
        }).catch(function (result) {
            return presale.investorCount.call();
        }).then(function (_ic) {
            assert.equal(_ic, 0, "investorcount shouldn't have been updated");
        });
    });

    it("it should  be possible to buy once allowed", function () {
        var presale;
        return Presale.deployed()
            .then(function (instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function () {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(1)
                });
            })
            .then(function () {
                return presale.investorCount.call();
            })
            .then(function (_ic) {
                assert.equal(_ic, 1, "investorcount shouldn't have been updated");
            });
    });

    it("total wei raised is correct after buying", function () {
        var presale;
        return Presale.new(3575, accounts[0])
            .then(function (instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function () {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(1)
                });
            })
            .then(function () {
                return presale.weiRaised.call();
            })
            .then(function (wr) {
                assert.equal(wr.toNumber(), web3.toWei(1), "total wei raised was not correct");
            });
    });

    it("assigned tokens are correct after buying", function () {
        var presale;
        var rate = 3575;
        var buyin = 2;
        return Presale.new(3575, accounts[0])
            .then(function (instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function () {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(buyin)
                });
            })
            .then(function () {
                return presale.balanceOf(accounts[0]);
            })
            .then(function (bal) {
                assert.equal(bal.toNumber(), web3.toWei(buyin * rate), "balance was not correct after buying");
            });
    });

    it("deposits are correct after buying", function () {
        var presale;
        var rate = 3575;
        var buyin = 2;
        return Presale.new(3575, accounts[0])
            .then(function (instance) {
                presale = instance;
                return presale.allow(accounts[0], {
                    from: accounts[0]
                });
            })
            .then(function () {
                return presale.buyTokens(accounts[0], {
                    from: accounts[0],
                    value: web3.toWei(buyin)
                });
            })
            .then(function () {
                return presale.depositsOf(accounts[0]);
            })
            .then(function (bal) {
                assert.equal(bal.toNumber(), web3.toWei(buyin), "balance was not correct after buying");
            });
    });
});