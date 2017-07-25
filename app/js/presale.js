window.App = {
  ex: {
    accounts: [],
    Presale: null,
    selectedAccount: null
  },
  loadContract: function (_callback) {
    $.getJSON("./contracts/Presale.json", function (Presale_json) {
      console.log(Presale_json);
      App.ex.Presale = TruffleContract(Presale_json);
      App.ex.Presale.setProvider(window.web3.currentProvider);
      _callback();
    });
  },
  init: function () {
    $("#btnBuy").click(App.buy);
    $("#btnProxyBuy").click(function () {

    });
    this.loadContract(this.start);
  },
  allow: function () {
    App.ex.Presale.deployed().then(function (instance) {
      return instance.allow(instance.address, {
        from: web3.eth.accounts[0]
      });
    }).then(function (result) {
      console.log(result);
    });
  },
  buy: function () {
    App.ex.Presale.deployed().then(function (instance) {
      return instance.buyTokens(instance.address, {
        from: web3.eth.accounts[0],
        value: web3.toWei(1)
      });
    }).then(function (result) {
      console.log(result);
    });
  },
  onBuy: function (result) {
    console.log(result);
  },
  requestProxyBuy: function () {

  },
  start: function () {
    var self = this;
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      App.ex.accounts = accs;

      var x = document.getElementById("accountSelect");

      var l = App.ex.accounts.length;
      for (i = 0; i < l; i++) {
        var option = document.createElement("option");
        option.text = App.ex.accounts[i];
        console.log(App.ex.accounts[i]);
        x.add(option);
      }
      $('#accountSelect').material_select();
      $("#accountSelect").change(function (e) {
        App.ex.selectedAccount = ($("#accountSelect option:selected").first().text());
      });
      App.refreshContractInformation();
    });
  },
  refreshContractInformation: function () {
    var self = this;
    var presale;
    App.ex.Presale.deployed().then(function (instance) {
      presale = instance;
      return presale.rate.call();
    }).then(function (_rate) {
      $("#fndCurrentRate").html(_rate.toNumber());
      return presale.weiRaised.call();
    }).then(function (_wei) {
      $("#fndTotalRaised").html(web3.fromWei(_wei.toNumber()) + " ether");
      return presale.investorCount.call();
    }).then(function (_investorCount) {
      $("#fndTotalBackers").html(_investorCount.toNumber());
      return presale.owner.call();
    }).then(function (_owner) {
      console.log(_owner);
    });
  }
};

$(document).ready(function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.log("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  App.init();
});