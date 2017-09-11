pragma solidity ^0.4.15;


import "./Ownable.sol";


/**
 * @title Whitelistable
 * @dev Base contract which allows children to implement action for a whitelist or for everyone.
 */
contract Whitelistable is Ownable {
  event AllowEveryone();
  event AllowWhiteList();

  // Flag to turn of the whitelist restriction
  bool public everyoneDisabled = true;


  /**
   * @dev modifier to allow actions only for whitelisted users
   */
  modifier whenNotEveryone() {
    require(everyoneDisabled);
    _;
  }

  /**
   * @dev modifier to allow actions for everybody
   */
  modifier whenEveryone() {
    require(!everyoneDisabled);
    _;
  }

  /**
   * @dev called by the owner to allow everyone
   */
  function allowEveryone() onlyOwner whenNotEveryone {
    everyoneDisabled = false;
    AllowEveryone();
  }

  /**
   * @dev called by the owner to limit to whitelist users
   */
  function allowWhiteList() onlyOwner whenEveryone {
    everyoneDisabled = true;
    AllowWhiteList();
  }
}