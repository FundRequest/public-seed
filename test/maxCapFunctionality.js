const PUB_SEED = artifacts.require('./presale/FundRequestPublicSeed.sol');
const expect = require('chai').expect;


contract('FundrequestPublicSeed', (accounts) => {

    let seed;
    const owner = accounts[0];
    const maxCap = 20 /* ether */ ;
    const rate = 3600;

    beforeEach(async() => {
        seed = await PUB_SEED.new(rate, maxCap, owner);
        await seed.allowEveryone({
            from: owner
        });
    });

    it("it should be possible to invest less than maxcap", async() => {
        await seed.buyTokens(owner, {
            from: owner,
            value: web3.toWei(10, 'ether')
        });
        let weiRaised = web3.fromWei((await seed.weiRaised.call()).toNumber());
        expect(weiRaised).to.equal('10');
    });

    it("it should not possible to invest more than maxcap", async() => {
        try {
            await seed.buyTokens(owner, {
                from: owner,
                value: web3.toWei(21, 'ether')
            });
            expect.fail('should never invest more than the cap');
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
        let weiRaised = web3.fromWei((await seed.weiRaised.call()).toNumber());
        expect(weiRaised).to.equal('0');
    });

    it("it should not possible to invest if it would break the cap", async() => {
        try {
            await seed.buyTokens(owner, {
                from: owner,
                value: web3.toWei(5, 'ether')
            });
            await seed.buyTokens(owner, {
                from: owner,
                value: web3.toWei(17, 'ether')
            });
            expect.fail('should never invest more than the cap');
        } catch (error) {
            assert(
                error.message.indexOf('invalid opcode') >= 0,
                'releaseTokenTransfer should throw an opCode exception.'
            );
        }
        let weiRaised = web3.fromWei((await seed.weiRaised.call()).toNumber());
        expect(weiRaised).to.equal('5');
    });
});