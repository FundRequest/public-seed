pragma solidity ^0.4.11;

import './math/SafeMath.sol';
import './zeppelin/Haltable.sol'

contract Presale {
  using SafeMath for uint256;

  // The token being sold
  MintableToken public token;

  // start and end block where investments are allowed (both inclusive)
  uint256 public startBlock;
  uint256 public endBlock;

  // address where funds are collected
  address public wallet;

  // how many token units a buyer gets per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;
  
  mapping(address => uint) public balances;
  address[] public investors;
  uint public investorCount;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */ 
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  function Presale(uint256 _startBlock, uint256 _endBlock, uint256 _rate, address _wallet) {
    require(_startBlock >= block.number);
    require(_endBlock >= _startBlock);
    require(_rate > 0);
    require(_wallet != 0x0);

    startBlock = _startBlock;
    endBlock = _endBlock;
    rate = _rate;
    wallet = _wallet;
  }

  // low level token purchase function
  function buyTokens(address investor) payable {
    require(beneficiary != 0x0);
    require(validPurchase());

    bool existing = balances[investor] > 0;

    uint256 weiAmount = msg.value;
    uint256 updatedWeiRaised = weiRaised.add(weiAmount);

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);
    weiRaised = updatedWeiRaised;
    balances[investor] = balances[investor].plus(msg.value);

    if(!existing) {
      investors.push(investor);
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

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    uint256 current = block.number;
    bool withinPeriod = current >= startBlock && current <= endBlock;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    return block.number > endBlock;
  }

  
  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }
}