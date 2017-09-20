const PUB_SEED = artifacts.require('./presale/FundRequestPublicSeed.sol');
const expect = require('chai').expect;

contract('FundRequestPublicSeed', function (accounts) {

    let seed;
    const owner = accounts[0];

    beforeEach(async function () {
        seed = await PUB_SEED.new(3600, 1000, owner);
    });

    it('should be possible to invest with amount less than 20 ether', async function () {
        await seed.allowEveryone({
            from: accounts[0]
        });
        await seed.buyTokens(accounts[1], {
            from: accounts[0],
            value: web3.toWei(19)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(19));
    });

    it('should be possible to invest with amount less than 20 ether in a whitelist period', async function () {
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

    it('should not be possible to invest with amount more than 20 ether in whitelist period', async function () {
        await seed.allow(accounts[1], {
            from: accounts[0]
        });
        try {
            await seed.buyTokens(accounts[1], {
                from: accounts[0],
                value: web3.toWei(21)
            });
            expect.fail('we were able to buy tokens');
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
    });

    it('should not be possible to invest with amount more than 20 ether in whitelist period in multiple tries', async function () {
        await seed.allow(accounts[1], {
            from: accounts[0]
        });
        await seed.buyTokens(accounts[1], {
            from: accounts[0],
            value: web3.toWei(10)
        });
        await seed.buyTokens(accounts[1], {
            from: accounts[0],
            value: web3.toWei(9)
        });
        try {
            await seed.buyTokens(accounts[1], {
                from: accounts[0],
                value: web3.toWei(2)
            });
            expect.fail('we were able to buy tokens');
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
    });

    it('should be possible to invest with amount more than 20 ether in a nonwhitelist period', async function () {
        await seed.allowEveryone({
            from: accounts[0]
        });
        await seed.buyTokens(accounts[1], {
            from: accounts[0],
            value: web3.toWei(21)
        });
        let weiRaised = (await seed.weiRaised.call()).toNumber();
        expect(weiRaised.toString()).to.equal(web3.toWei(21));
    });
});