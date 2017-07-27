pragma solidity ^0.4.11;

import '../math/SafeMathLib.sol';
import '../zeppelin/Pausable.sol';

contract FundRequestPrivateSeed is Pausable {
  using SafeMathLib for uint;
  
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
  
  function FundRequestPrivateSeed(uint _rate, address _wallet) {
    require(_rate > 0);
    require(_wallet != 0x0);

    rate = _rate;
    wallet = _wallet;
  }
  // low level token purchase function
  function buyTokens(address beneficiary) payable whenNotPaused {
    require(validBeneficiary(beneficiary));
    require(validPurchase());
    bool existing = deposits[beneficiary] > 0;
    uint weiAmount = msg.value;
    uint updatedWeiRaised = weiRaised.plus(weiAmount);
    // calculate token amount to be created
    uint tokens = weiAmount.times(rate);
    weiRaised = updatedWeiRaised;
    deposits[beneficiary] = deposits[beneficiary].plus(msg.value);
    balances[beneficiary] = balances[beneficiary].plus(tokens);
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

  function updateWallet(address _wallet) onlyOwner whenPaused {
    require(_wallet != 0x0);
    wallet = _wallet;
  }
  
  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }
}