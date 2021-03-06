/* global jQuery, Materialize */

(function ($) {
  'use strict';

  const $document = $(document);

  const messageTimes = {
    medium: 6000,
    longer: 8000
  };

  const constants = {
    CONTRACT_LOC: '0x65c8eb2ece64a686f7e990ce2e1cadf498156388',
    PREVIOUSLY_RAISED: 1946751226270900000000,
    PRIVATE_RATE: 4500,
    PUBLIC_RATE: 3600,
    PREVIOUSLY_SOLD_TOKENS: Math.round((1946751226270900000000 * 4500 / Math.pow(10, 18)) * 100) / 100
  };


  const elements = {
    buttons: {
      $buy: $('#btnBuy'),
      $allow: $('#btnAllow')
    },
    checkboxes: {
      $confirmTerms: $('#filled-in-box')
    },
    $accountSelect: $('#accountSelect'),
    $amount: $('#amount'),
    $busy: $('#busy'),
    $progressBar: $('#progressBar'),
    $personalStash: $('#personalStash'),
    $presaleSection: $('#presaleSection'),
    $fndCurrentRate: $('#fndCurrentRate'),
    $fndYourTokens: $('#fndYourTokens'),
    $fndTotalBackers: $('#fndTotalBackers'),
    $fndTotalRaised: $('#fndTotalRaised'),
    $fndTotalTokensSold: $('#fndTotalTokensSold'),
    $fndTotalLeft: $('#fndTotalLeft'),
    $targetAddress: $('#targetAddress'),
    $targetAddressLabel: $('#targetAddressLabel'),
    $contractAddressLabel: $('#contractAddressLabel'),
    $whiteListArea: $('#whitelistarea'),
    $contractLocation: $('.contractLocation'),
    $immediateBuySection: $('#immediateBuySection'),
    $immediateBuyAgreement: $('#immediate-buy-agreement'),
    $immediateBuyContractInformation: $('#immediateBuyContractInformation')
  };

  function showLoader() {
    elements.$busy.show();
  }

  function hideLoader() {
    elements.$busy.hide();
  }

  function showImmediateBuySection() {
    elements.$immediateBuySection.show();
    elements.$immediateBuyAgreement.on('change', function () {
      showImmediateBuyContractInformation(this.checked);
    });
  }

  function showImmediateBuyContractInformation(show) {
    if (show) {
      elements.$immediateBuyContractInformation.show();
      elements.$contractLocation.text(constants.CONTRACT_LOC);
      elements.$contractLocation.attr('href', 'https://etherscan.io/address/' + constants.CONTRACT_LOC + '#code');
      elements.$immediateBuySection.hide();
    }
  }

  function showPresaleSection() {
    elements.$presaleSection.show();
    showImmediateBuyContractInformation(true);
  }

  function hidePresaleSection() {
    elements.$presaleSection.show();
  }

  const presale = (function () {
    const updateTokens = async function (address) {
      try {
        let _tokens = await presaleContract.balanceOf.call(address);
        elements.$fndYourTokens.html(web3.fromWei(_tokens.toNumber()));
      } catch (error) {
        Materialize.toast('Please check your settings. The presale is not deployed on your current network.', messageTimes.medium);
        hidePresaleSection();
      }
    };
    let presaleContract = {};

    const colors = {
      GREEN: 'green',
      BLUE: 'blue'
    };

    const ex = {
      accounts: [],
      selectedAccount: null,
      owner: null
    };

    function loadContract(_callback) {
      $.getJSON('./contracts/FundRequestPublicSeed.json', function (Presale_json) {
        const presaleTruffleContract = TruffleContract(Presale_json);
        presaleTruffleContract.setProvider(window.web3.currentProvider);

        presaleTruffleContract.deployed().then(function (instance) {
          presaleContract = instance;
          constants.CONTRACT_LOC = presaleContract.address;
          _callback();
        });
      });
    }

    function allow() {
      showLoader();

      const _target = elements.$targetAddress.val();
      const _from = ex.selectedAccount;

      presaleContract.allow(
        _target, {
          from: _from
        }
      ).then(function () {
        Materialize.toast('Account submitted to the whitelist', messageTimes.medium, colors.BLUE);
        hideLoader();
      }).catch(function (err) {
        Materialize.toast('Whitelisting failed.', messageTimes.medium);
        console.log(err);
        hideLoader();
      });
    }

    var buy = async () => {
      let chosenAmount = elements.$amount.val();
      let targetAddress = elements.$targetAddress.val();
      let errorMessage = '';

      if (!elements.checkboxes.$confirmTerms.is(':checked')) {
        errorMessage = 'Please accept the Terms and Conditions.';
      } else if (typeof targetAddress === 'undefined' || targetAddress === '') {
        errorMessage = 'Please select an account first.';
      } else if (typeof chosenAmount === 'undefined' || chosenAmount === '') {
        errorMessage = 'Please select an amount first.';
      }

      if (errorMessage !== '') {
        Materialize.toast(errorMessage, messageTimes.medium, colors.BLUE);
        return;
      }

      let everyoneDisabled = await presaleContract.everyoneDisabled.call();
      presaleContract.allowed.call(ex.selectedAccount).then(function (result) {
        if (result === true || everyoneDisabled == false) {
          if (result === true && everyoneDisabled == true && chosenAmount > 25) {
            throw new Error("During priority pass period, you can only fund up to 25 ether!");
          }
          showLoader();
          Materialize.toast('Please wait while the transaction is being validated...', messageTimes.medium, colors.BLUE);

          return presaleContract.buyTokens(targetAddress, {
            from: ex.selectedAccount,
            value: web3.toWei(chosenAmount),
            gas: 210000
          });
        } else {
          throw new Error('Unable to fund from this address because it is not whitelisted.');
        }
      }).then(function (result) {
        const txHash = result.tx;
        const $link = $(document.createElement('a'))
          .attr('href', 'https://etherscan.io/tx/' + txHash)
          .attr('target', '_blank')
          .attr('class', 'yellow-text toast-action')
          .html('View on EtherScan&nbsp;&nbsp;&nbsp;');
        const $toastContent = $(document.createElement('span'))
          .text('Funding submitted to the Ethereum blockchain')
          .add($link);

        Materialize.toast($toastContent, messageTimes.longer, colors.GREEN);
        updateTokens(ex.selectedAccount);
        document.getElementById("personalStash").style.opacity = 1;

        hideLoader();
      }).catch(function (err) {
        const $link = $(document.createElement('a'))
          .attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#readContract')
          .attr('target', '_blank')
          .attr('class', 'yellow-text toast-action')
          .html('Inspect on EtherScan&nbsp;&nbsp;&nbsp;');
        const errorMsg = err && err.message ? err.message : 'Something went wrong. Please check if you\'re whitelisted.';
        const $toastContent = $(document.createElement('span'))
          .text(errorMsg)
          .add($link);

        Materialize.toast($toastContent, messageTimes.longer);
        hideLoader();
      });
    }

    function accountsAreInvalid(err, accounts) {
      if (err !== null) {
        Materialize.toast('There was an error fetching your accounts.', messageTimes.medium);
        return true;
      }
      if (accounts.length === 0) {
        Materialize.toast('Couldn\'t get any accounts! Please check your Ethereum client.', messageTimes.medium, colors.BLUE);
        return true;
      }
      return false;
    }

    var fillAccounts = async (accounts) => {
      ex.accounts = accounts;
      $.each(ex.accounts, function (i, item) {
        const option = document.createElement('option');
        option.text = item;
        option.className = 'dropdown-content';

        elements.$accountSelect.append(option);
      });

      updateTokens(ex.accounts[0]);

      elements.$accountSelect.material_select();
      elements.$accountSelect.on('change', function () {
        ex.selectedAccount = $('option:selected', elements.$accountSelect).first().text();
        elements.$targetAddress.val(ex.selectedAccount);
        elements.$targetAddressLabel.html(ex.selectedAccount);

        updateTokens(ex.selectedAccount);

        if (ex.selectedAccount === ex.owner) {
          elements.$whiteListArea.show();
        }

        Materialize.updateTextFields();
        document.getElementById("personalStash").style.opacity = 1;

        let everyoneDisabled = presaleContract.everyoneDisabled.call();
        if (everyoneDisabled == true) {
          let allowed = presaleContract.allowed.call(ex.selectedAccount);
          if (result === false) {
            const errorMessage = 'Unable to fund from this address because it is not whitelisted.';
            Materialize.toast(errorMessage, messageTimes.medium, colors.BLUE);
          }
        }
        updateButtons();
      });
    }

    var updateRate = async () => {
      let _rate = await presaleContract.rate.call()
      elements.$fndCurrentRate.html(_rate.toNumber());
    }

    var updateInvestorCount = async () => {
      let _investorCount = await presaleContract.investorCount.call();
      elements.$fndTotalBackers.html(_investorCount.toNumber() + 11);
    }

    const refreshContractInformation = async function () {
      try {
        updateRate();
        updateInvestorCount();

        let _isEveryoneDisabled = await presaleContract.everyoneDisabled.call();
        let _isPaused = await presaleContract.paused.call();
        let _weiRaised = (await presaleContract.weiRaised.call()).toNumber();
        let _weiMaxCap = (await presaleContract.weiMaxCap.call()).toNumber();
        let _weiLeft = _weiMaxCap - _weiRaised;
        let etherLeft = (_weiLeft / Math.pow(10, 18));

        const totalRaised = (Math.round(web3.fromWei(constants.PREVIOUSLY_RAISED + _weiRaised) * 100) / 100).toFixed(2);

        const tokensSold = constants.PREVIOUSLY_SOLD_TOKENS + ((_weiRaised * constants.PUBLIC_RATE) / Math.pow(10, 18));
        elements.$fndTotalTokensSold.html(tokensSold);

        elements.$fndTotalLeft.html(etherLeft);
        elements.$fndTotalRaised.html(totalRaised);

        showProgress(_weiLeft, _weiMaxCap);
        updateTimeline(_isEveryoneDisabled, _isPaused);

        ex.owner = await presaleContract.owner.call();
        setTimeout(refreshContractInformation, 10000);
      } catch (error) {
        console.log(error);
        Materialize.toast('Please check your settings. The presale is not deployed on your current network.', messageTimes.medium);
        hidePresaleSection();
      }
    };

    function showProgress(_raised, _max) {
      if (_raised && _max) {
        let remainingInPercentagePublicSeed = round(_raised / _max * 100, 2);
        elements.$progressBar.find('[data-bar]').attr('style', 'width: ' + (100 - remainingInPercentagePublicSeed) + '%');
        elements.$progressBar.find('[data-bar-value]').text(remainingInPercentagePublicSeed);
      }
    }

    function round(value, precision) {
      let multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    }

    function updateTimeline(everyoneDisabled, paused) {
      let activeTimelineStep = 'waiting';

      if (!paused && everyoneDisabled) {
        activeTimelineStep = 'priority'
      } else if (!paused && !everyoneDisabled) {
        activeTimelineStep = 'public';
      } else if (paused && !everyoneDisabled) {
        activeTimelineStep = 'closed';
      }

      $('.timeline-step[data-timeline-step]').removeClass('active');
      $('.timeline-step[data-timeline-step="' + activeTimelineStep + '"]').addClass('active');
    }

    function updateButtons() {
      const isConfirmTermsChecked = elements.checkboxes.$confirmTerms.is(':checked');
      const isAddressSelected = elements.$accountSelect.val() !== null;
      const isAmountNotNull = elements.$amount.val() > 0;

      if (isConfirmTermsChecked && isAddressSelected && isAmountNotNull) {
        enableButton(elements.buttons.$buy);
      } else {
        disableButton(elements.buttons.$buy);
      }
    }

    function fillContractAddress() {
      const $link = $(document.createElement('a'))
        .attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#readContract')
        .attr('target', '_blank')
        .html(presaleContract.address);
      const $contractAddressLabelContent = $(document.createElement('span'))
        .text('The private seed contract is located at ')
        .add($link);

      elements.$contractAddressLabel.html($contractAddressLabelContent);
    }

    const start = function () {

      elements.$contractLocation.text(presaleContract.address);
      elements.$contractLocation.attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#code');

      web3.eth.getAccounts(function (err, accounts) {
        refreshContractInformation();
        fillContractAddress();
        if (!accountsAreInvalid(err, accounts)) {
          fillAccounts(accounts);
        }
      });
    };

    const init = function () {
      disableButton(elements.buttons.$buy);
      elements.buttons.$buy.on('click', buy);
      elements.buttons.$allow.on('click', allow);
      elements.checkboxes.$confirmTerms.on('click', updateButtons);
      elements.checkboxes.$confirmTerms.on('change', function () {
        if (this.checked) {
          elements.$immediateBuyContractInformation.show();
          elements.$contractLocation.text(presaleContract.address);
          elements.$contractLocation.attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#code');
        }
      });
      elements.$amount.on('change', updateButtons);

      updateButtons();
      loadContract(start);
    };

    return {
      init: init
    };
  })();

  $(function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.log(web3.currentProvider);
      window.web3 = new Web3(web3.currentProvider);
      showPresaleSection();
    } else {
      window.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/mew'));
      showImmediateBuySection();
    }
    presale.init();
  });

  function enableButton($button) {
    $button.removeClass('custom_btn').addClass('custom_teal');
  }

  function disableButton($button) {
    $button.removeClass('custom_teal').addClass('custom_btn');
  }
})(jQuery);