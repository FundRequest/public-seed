const PUB_SEED = artifacts.require('./presale/FundRequestPublicSeed.sol');
const expect = require('chai').expect;


contract('FundrequestPublicSeed', (accounts) => {

    let seed;
    const owner = accounts[0];
    const rate = 3600;

    beforeEach(async() => {
        seed = await PUB_SEED.new(rate, 1000, owner);

    });

    it("investing should net you with the correct amount of tokens [everyone allowed]", async() => {
        await seed.allowEveryone({
            from: owner
        });

        let investment = 1 /* ether */ ;
        await seed.buyTokens(owner, {
            from: owner,
            value: web3.toWei(investment)
        });

        let _balance = (await seed.balanceOf(owner)).toNumber();
        expect(_balance).to.equal((investment * rate) * Math.pow(10, 18));
    });


    it("investing multiple times should net you with the correct amount of tokens [everyone allowed]", async() => {
        await seed.allowEveryone({
            from: owner
        });

        let investment1 = 3 /* ether */ ;
        let investment2 = 1 /* ether */ ;
        await seed.buyTokens(owner, {
            from: owner,
            value: web3.toWei(investment1)
        });
        await seed.buyTokens(owner, {
            from: owner,
            value: web3.toWei(investment2)
        });


        let _balance = (await seed.balanceOf(owner)).toNumber();
        expect(_balance).to.equal(((investment1 + investment2)  * rate) * Math.pow(10, 18));
    });

    it("investing should net you with the correct amount of tokens [whitelist period]", async() => {
        await seed.allow(accounts[1], {
            from: owner
        });

        let investment = 1 /* ether */ ;
        await seed.buyTokens(accounts[1], {
            from: owner,
            value: web3.toWei(investment)
        });

        let _balance = (await seed.balanceOf(accounts[1])).toNumber();
        expect(_balance).to.equal((investment * rate) * Math.pow(10, 18));
    });


    it("investing multiple times should net you with the correct amount of tokens [whitelist period]", async() => {
        await seed.allow(accounts[1], {
            from: owner
        });

        let investment1 = 3 /* ether */ ;
        let investment2 = 1 /* ether */ ;
        await seed.buyTokens(accounts[1], {
            from: owner,
            value: web3.toWei(investment1)
        });
        await seed.buyTokens(accounts[1], {
            from: owner,
            value: web3.toWei(investment2)
        });


        let _balance = (await seed.balanceOf(accounts[1])).toNumber();
        expect(_balance).to.equal(((investment1 + investment2)  * rate) * Math.pow(10, 18));
    });
});