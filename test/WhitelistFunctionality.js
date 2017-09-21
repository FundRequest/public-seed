const PUB_SEED = artifacts.require('./presale/FundRequestPublicSeed.sol');
const expect = require('chai').expect;


contract('FundrequestPublicSeed', (accounts) => {

    let seed;
    const owner = accounts[0];

    beforeEach(async() =>  {
        seed = await PUB_SEED.new(3600, 1000, owner);
    });

    it('should be possible to invest for someone else who is whitelisted in a whitelist period', async() =>  {
        await seed.allow(accounts[1], {
            from: accounts[0]
        });
        await seed.buyTokens(accounts[1], {
            from: accounts[0],
            value: web3.toWei(19)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(19));
    });

    it('should be possible to invest as whitelisted person in whitelisting period', async() =>  {
        await seed.allow(accounts[0], {
            from: accounts[0]
        });
        await seed.buyTokens(accounts[0], {
            from: accounts[0],
            value: web3.toWei(19)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(19));
    });

    it('should not possible to invest for a non-whitelisted person in whitelisting period', async() =>  {
        try {
            await seed.buyTokens(accounts[0], {
                from: accounts[0],
                value: web3.toWei(19)
            });
            expect.fail("we were able to buy");
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
    });

    it('should be possible to invest for someone else in a non-whitelist period', async() =>  {
        await seed.allowEveryone({
            from: accounts[0]
        });
        await seed.buyTokens(accounts[2], {
            from: accounts[0],
            value: web3.toWei(19)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(19));
        let theDeposit = (await seed.deposits.call(accounts[2])).toNumber();
        expect(theDeposit.toString()).to.equal(web3.toWei(19));
    });

    it('should be possible to invest for yourself in a non-whitelist period', async() =>  {
        await seed.allowEveryone({
            from: accounts[0]
        });
        await seed.buyTokens(accounts[0], {
            from: accounts[0],
            value: web3.toWei(19)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(19));
        let theDeposit = (await seed.deposits.call(accounts[0])).toNumber();
        expect(theDeposit.toString()).to.equal(web3.toWei(19));
    });
});