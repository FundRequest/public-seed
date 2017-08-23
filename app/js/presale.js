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
    document.getElementById("btnBuy").style.property = "waves-effect waves-light btn-large custom_btn";
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
        Materialize.toast("Successfully whitelisted account.", 4000, "blue");
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
    if (document.getElementById("filled-in-box").checked == false ) {
      Materialize.toast("Please accept the Terms and Conditions.", 4000, "blue");
      return;
    }
    if (targetAddress == "") {
      Materialize.toast("Please select an account first", 4000, "blue");
      return;
    }
    if (chosenAmount == "") {
      Materialize.toast("Please select an amount first.", 4000, "blue");
      return;
    }
    if (chosenAmount < 0.05) {
      Materialize.toast("Private seed requires a minimum amount of 0.25ETH.", 4000, "blue");
      return;
    }
    App.ex.Presale.deployed().then(function (instance) {
      $("#busy").show();
      Materialize.toast("Please wait while the transaction is being validated...", 2000, "blue");      
      return instance.buyTokens(targetAddress, {
        from: App.ex.selectedAccount,
        value: web3.toWei(chosenAmount),
        gas: 210000
      });
    }).then(function (result) {
      var txHash = result.tx; 
      var $toastContent = $('<span>Funding submitted to the ethereum blockchain..</span>').add($('<a href="https://etherscan.io/tx/'+ txHash + '" target="_blanc" class="yellow-text toast-action ">View on EtherScan&nbsp;&nbsp;&nbsp;</a>'));
      Materialize.toast($toastContent, 4000, "green");
      $("#busy").hide();
      App.updateTokens(App.ex.selectedAccount);
      $("#personalStash").show();
    }).catch(function (err) {
      Materialize.toast("Something went wrong while trying fund. Please check if you're whitelisted.", 4000);
      $("#busy").hide();
    });
  },
  accountsAreInvalid: function (err, accs) {
    if (err != null) {
      Materialize.toast("There was an error fetching your accounts.", 4000)
      return true;
    }
    if (accs.length == 0) {
      Materialize.toast("Couldn't get any accounts! Please check our your Ethereum client.", 4000, "blue")
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
      option.className = "dropdown-content";
      x.add(option);
    }
    App.updateTokens(App.ex.accounts[0]);
    $('#accountSelect').material_select();
    $("#accountSelect").change(function (e) {
      App.ex.selectedAccount = ($("#accountSelect option:selected").first().text());
      $("#targetAddress").val(App.ex.selectedAccount);
      $("#targetAddressLabel").html(App.ex.selectedAccount);
      App.updateTokens(App.ex.selectedAccount);
      if (App.ex.selectedAccount == App.ex.owner) {
        $("#whitelistarea").show();
      }
      Materialize.updateTextFields();
      $("#personalStash").show();
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
        $("#fndTotalRaised").html(web3.fromWei(_wei.toNumber()) + " ETH");
        return presale.investorCount.call();
      }).then(function (_investorCount) {
        $("#fndTotalBackers").html( );
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
  var buyEnabled = false;
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
    $("#presaleSection").show();
  }
  $("#filled-in-box").click(function(){
    if (buyEnabled == false){
      document.getElementById("btnBuy").className = "waves-effect waves-light btn-large  custom_teal";
      buyEnabled = true;
    }
    else{
      document.getElementById("btnBuy").className = "waves-effect waves-light btn-large  custom_btn";
      buyEnabled = false;
    }

  });
  App.init();
});