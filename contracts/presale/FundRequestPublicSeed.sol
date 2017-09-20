pragma solidity ^0.4.15;

import '../math/SafeMath.sol';
import '../zeppelin/Pausable.sol';
import '../zeppelin/Whitelistable.sol';

contract FundRequestPublicSeed is Pausable, Whitelistable {
  using SafeMath for uint;

  // address where funds are collected
  address public wallet;
  // how many token units a buyer gets per wei
  uint public rate;
  // Max amount of ETH that can be raised (in wei)
  uint256 public weiMaxCap;
  // amount of raised money in wei
  uint256 public weiRaised;
  // max amount of ETH that is allowed to deposit when whitelist is active
  uint256 public maxPurchaseSize;
  
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

  function FundRequestPublicSeed(uint _rate, uint256 _maxCap, address _wallet) {
    require(_rate > 0);
    require(_maxCap > 0);
    require(_wallet != 0x0);

    rate = _rate;
    weiMaxCap = SafeMath.mul(_maxCap, 1 ether);
    wallet = _wallet;
    maxPurchaseSize = 20 ether;
  }
  
  // low level token purchase function
  function buyTokens(address beneficiary) payable whenNotPaused {
    require(validPurchase());
    require(maxCapNotReached());
    if (everyoneDisabled) {
      require(validBeneficiary(beneficiary));
      require(validPurchaseSize(beneficiary));  
    }
    
    
    bool existing = deposits[beneficiary] > 0;  
    uint weiAmount = msg.value;
    uint updatedWeiRaised = weiRaised.add(weiAmount);
    // calculate token amount to be created
    uint tokens = weiAmount.mul(rate);
    weiRaised = updatedWeiRaised;
    deposits[beneficiary] = deposits[beneficiary].add(msg.value);
    balances[beneficiary] = balances[beneficiary].add(tokens);
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
  // @return true if the amount is lower then 20ETH
  function validPurchaseSize(address beneficiary) internal constant returns (bool) {
    return msg.value.add(deposits[beneficiary]) <= maxPurchaseSize;
  }
  function maxCapNotReached() internal constant returns (bool) {
    return SafeMath.add(weiRaised, msg.value) <= weiMaxCap;
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
    require(_wallet != address(0));
    wallet = _wallet;
  }

  function updateMaxCap(uint _maxCap) onlyOwner whenPaused {
    require(_maxCap != 0);
    weiMaxCap = SafeMath.mul(_maxCap, 1 ether);
  }

  function updatePurchaseSize(uint _purchaseSize) onlyOwner whenPaused {
    require(_purchaseSize != 0);
    maxPurchaseSize = _purchaseSize;
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }
}
