const PUB_SEED = artifacts.require('./presale/FundRequestPublicSeed.sol');
const expect = require('chai').expect;


contract('FundrequestPublicSeed', (accounts) => {

  let seed;
  const owner = accounts[0];

  beforeEach(async() => {
    seed = await PUB_SEED.new(3600, 1000, owner);
  });

  it("it should have the correct rate", async() => {
    let initialRate = (await seed.rate.call()).toNumber();
    expect(initialRate).to.equal(3600);
  });

  it("it should have 0 backers to start", async() => {
    let ic = (await seed.investorCount.call()).toNumber();
    expect(ic).to.equal(0);
  });

  it("it should have a max wei cap as defined in eth", async() => {
    let cap = web3.fromWei((await seed.weiMaxCap.call()).toNumber());
    expect(cap.toString()).to.equal('1000');
  });

  it("it should have a rate as defined", async() => {
    let cap = (await seed.rate.call()).toNumber();
    expect(cap).to.equal(3600);
  });

  it("it should have a wallet as defined", async() => {
    let _wallet = await seed.wallet.call();
    expect(_wallet).to.equal(accounts[0]);
  });

});