pragma solidity ^0.4.11;

import './zeppelin/Pausable.sol';

contract Presale is Pausable {

  // address where funds are collected
  address public wallet;

  // how many token units a buyer gets per wei
  uint public rate;

  // amount of raised money in wei
  uint public weiRaised;
  
  mapping(address => uint) public deposits;
  mapping(address => uint) public balances;
  address[] public investors;
  uint public investorCount;

  mapping(address => bool) public allowed;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */ 
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint value, uint amount);

  function Presale(uint _rate, address _wallet) {
    //require(_rate > 0);
    //require(_wallet != 0x0);

    rate = _rate;
    wallet = _wallet;
  }

  // low level token purchase function
  function buyTokens(address beneficiary) payable whenNotPaused {
    require(validBeneficiary(beneficiary));
    require(validPurchase());

    bool existing = deposits[beneficiary] > 0;

    uint weiAmount = msg.value;
    uint updatedWeiRaised = plus(weiRaised, weiAmount);

    // calculate token amount to be created
    uint tokens = times(weiAmount, rate);
    weiRaised = updatedWeiRaised;
    deposits[beneficiary] = plus(deposits[beneficiary], weiAmount);
    balances[beneficiary] = plus(balances[beneficiary], tokens);

    if(!existing) {
      investors.push(beneficiary);
      investorCount++;
    }

    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  function validBeneficiary(address beneficiary) internal constant returns (bool) {
      return allowed[beneficiary] == true;
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    return msg.value != 0;
  }

  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  function depositsOf(address _owner) constant returns (uint deposit) {
    return deposits[_owner];
  }

  function allow(address beneficiary) onlyOwner {
    allowed[beneficiary] = true;
  }

  function updateRate(uint _rate) onlyOwner whenPaused {
    rate = _rate;
  }


  function plus(uint a, uint b) returns (uint) {
    uint c = a + b;
    assert(c>=a);
    return c;
  }

  function times(uint a, uint b) returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
  
  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }
}