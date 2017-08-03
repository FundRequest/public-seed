window.App = {
  ex: {
    accounts: [],
    Presale: null,
    selectedAccount: null,
    owner: null
  },
  loadContract: function (_callback) {
    $.getJSON("./contracts/FundRequestPrivateSeed.json", function (Presale_json) {
      App.ex.Presale = TruffleContract(Presale_json);
      App.ex.Presale.setProvider(window.web3.currentProvider);
      _callback();
    });
  },
  init: function () {
    $("#btnBuy").click(App.buy);
    $("#btnAllow").click(App.allow);
    this.loadContract(this.start);
  },
  allow: function () {
    App.ex.Presale.deployed().then(function (instance) {
        var _target = $("#targetAddress").val();
        var _from = App.ex.selectedAccount;
        $("#busy").show();
        return instance.allow(_target, {
          from: _from
        });
      }).then(function (result) {
        Materialize.toast("Successfully whitelisted user.", 4000);
        $("#busy").hide();
      })
      .catch(function (err) {
        Materialize.toast("Whitelisting failed.", 4000);
        console.log(err);
        $("#busy").hide();
      });
  },
  buy: function () {
    var chosenAmount = $("#amount").val();
    var targetAddress = $("#targetAddress").val();
    if (chosenAmount == "") {
      Materialize.toast("Please select an amount first.", 4000);
      return;
    }
    if (targetAddress == "") {
      Materialize.toast("Please select an account first", 4000);
      return;
    }
    App.ex.Presale.deployed().then(function (instance) {
      $("#busy").show();
      return instance.buyTokens(targetAddress, {
        from: App.ex.selectedAccount,
        value: web3.toWei(chosenAmount)
      });
    }).then(function (result) {
      Materialize.toast("Tokens acquired.", 4000);
      $("#busy").hide();
    }).catch(function (err) {
      Materialize.toast("Something went wrong while trying to buy tokens. Please check if you're whitelisted.", 4000);
      $("#busy").hide();
    });
  },
  accountsAreInvalid: function (err, accs) {
    if (err != null) {
      Materialize.toast("There was an error fetching your accounts.", 4000)
      return true;
    }
    if (accs.length == 0) {
      Materialize.toast("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.", 4000)
      return true;
    }
    return false;
  },
  fillAccounts: function (accs) {
    var x = document.getElementById("accountSelect");
    App.ex.accounts = accs;

    var l = App.ex.accounts.length;
    for (i = 0; i < l; i++) {
      var option = document.createElement("option");
      option.text = App.ex.accounts[i];
      x.add(option);
    }

    $('#accountSelect').material_select();
    $("#accountSelect").change(function (e) {
      App.ex.selectedAccount = ($("#accountSelect option:selected").first().text());
      $("#targetAddress").val(App.ex.selectedAccount);
      $("#targetAddressLabel").html(App.ex.selectedAccount);
      App.updateTokens(App.ex.selectedAccount);
      if (App.ex.selectedAccount == App.ex.owner) {
        $("#btnAllow").show();
      }
      Materialize.updateTextFields();
    });
  },
  start: function () {
    var self = this;
    web3.eth.getAccounts(function (err, accs) {
      if (App.accountsAreInvalid(err, accs)) {
        return;
      }

      App.fillAccounts(accs);
      App.refreshContractInformation();
    });
  },
  updateTokens: function (address) {
    var self = this;
    var presale;
    App.ex.Presale.deployed().then(function (instance) {
      presale = instance;
      return presale.balanceOf.call(address).then(function (_tokens) {
        $("#personalStash").show();
        $("#fndYourTokens").html(web3.fromWei(_tokens.toNumber()));
      });
    }).catch(function (err) {
      Materialize.toast("Please check your settings. The presale is not deployed on your current network.", 4000);
      $("#presaleSection").hide();
    });
  },
  refreshContractInformation: function () {
    var self = this;
    var presale;
    App.ex.Presale.deployed().then(function (instance) {
      presale = instance;
      return presale.rate.call().then(function (_rate) {
        $("#fndCurrentRate").html(_rate.toNumber());
        return presale.weiRaised.call();
      }).then(function (_wei) {
        $("#fndTotalRaised").html(web3.fromWei(_wei.toNumber()) + " ether");
        return presale.investorCount.call();
      }).then(function (_investorCount) {
        $("#fndTotalBackers").html(_investorCount.toNumber());
        return presale.owner.call();
      }).then(function (_owner) {
        App.ex.owner = _owner;
      });
    }).catch(function (err) {
      Materialize.toast("Please check your settings. The presale is not deployed on your current network.", 4000);
      $("#presaleSection").hide();
    });
    setTimeout(App.refreshContractInformation, 20000);
  }
};

$(document).ready(function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
    $("#presaleSection").show();
  }
  App.init();
});