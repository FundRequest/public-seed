// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import presale_artifacts from '../../build/contracts/Presale.json'

var Presale = contract(presale_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;


window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Presale.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshContractInformation();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },


  refreshContractInformation: function(){
    var self = this;
    var ui_contract_address = document.getElementById("ui_contract_address");
    var ui_contract_owner = document.getElementById("ui_contract_owner");
    var ui_contract_balance = document.getElementById("ui_contract_balance");

    FundRequestPreSale.deployed().then(function(instance){
      console.log("contract address : " + instance.address);
      ui_contract_address.innerHTML = instance.address;
      
      web3.eth.getBalance(instance.address, function(error, result){
        if (!error) {
          ui_contract_balance.innerHTML = result.toString();
        } else {
           self.setStatus("Error getting contract balance; see log.");
        }
      });


      return instance.getOwner.call();
    }).then(function(value) {
      console.log("contract owner   : " + value.valueOf());
      ui_contract_owner.innerHTML = value;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting contract address; see log.");
    });
  },

  
  changeOwner: function() {
    var self = this;
    var newOwner = document.getElementById("new_owner").value;
    console.log("Trying to change owner to : " + newOwner);
    this.setStatus("Initiating changing owner... (please wait)");

    console.log("using account to send tx from: " + accounts[0]);

    FundRequestPreSale.deployed().then(function(instance) {
      return instance.transferOwnership(newOwner, { from: accounts[0] });
    }).then(function() {
      console.log("Owner changed");
      web3.eth.filter('latest', function(error, result){
        if (!error) {
          self.refreshContractInformation();
          self.setStatus("Owner has been updated.");
        } else {
          console.error(error);
        }
      });
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error changing owner; see log.");
    });

  }  
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
