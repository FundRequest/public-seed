/* global jQuery, Materialize */

(function ($) {
    'use strict';

    var $document = $(document);

    var messageTimes = {
        medium: 6000,
        longer: 8000
    };

    const constants = {
        CONTRACT_LOC : '0x0'
    }

    var elements = {
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
        $personalStash: $('#personalStash'),
        $presaleSection: $('#presaleSection'),
        $fndCurrentRate: $('#fndCurrentRate'),
        $fndYourTokens: $('#fndYourTokens'),
        $fndTotalBackers: $('#fndTotalBackers'),
        $fndTotalRaised: $('#fndTotalRaised'),
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
        })
    }

    function showImmediateBuyContractInformation(show) {
        if(show) {
            elements.$immediateBuyContractInformation.show();
            elements.$contractLocation.text(constants.CONTRACT_LOC);
        } else {
            elements.$immediateBuyContractInformation.hide();        
        }
    }

    function showPresaleSection() {
        elements.$presaleSection.show();
    }

    function hidePresaleSection() {
        elements.$presaleSection.show();
    }

    var presale = (function () {
        var presaleContract = {};

        var colors = {
            GREEN: 'green',
            BLUE: 'blue'
        };

        var ex = {
            accounts: [],
            selectedAccount: null,
            owner: null
        };

        function loadContract(_callback) {
            $.getJSON('./contracts/FundRequestPublicSeed.json', function (Presale_json) {
                var presaleTruffleContract = TruffleContract(Presale_json);
                presaleTruffleContract.setProvider(window.web3.currentProvider);

                presaleTruffleContract.deployed().then(function (instance) {
                    presaleContract = instance;
                    _callback();
                });
            });
        }

        function allow() {
            showLoader();

            var _target = elements.$targetAddress.val();
            var _from = ex.selectedAccount;

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

        function buy() {
            var chosenAmount = elements.$amount.val();
            var targetAddress = elements.$targetAddress.val();
            var errorMessage = '';

            if (!elements.checkboxes.$confirmTerms.is(':checked')) {
                errorMessage = 'Please accept the Terms and Conditions.';
            } else if (typeof targetAddress === 'undefined' || targetAddress === '') {
                errorMessage = 'Please select an account first.';
            } else if (typeof chosenAmount === 'undefined' || chosenAmount === '') {
                errorMessage = 'Please select an amount first.';
            } else if (typeof chosenAmount === 'undefined' || chosenAmount < 25) {
                errorMessage = 'Private seed requires a minimum amount of 25 ETH.';
            }

            if (errorMessage !== '') {
                Materialize.toast(errorMessage, messageTimes.medium, colors.BLUE);
                return;
            }

            presaleContract.allowed.call(ex.selectedAccount).then(function (result) {
                if (result === true) {
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
                var txHash = result.tx;
                var $link = $(document.createElement('a'))
                    .attr('href', 'https://etherscan.io/tx/' + txHash)
                    .attr('target', '_blank')
                    .attr('class', 'yellow-text toast-action')
                    .html('View on EtherScan&nbsp;&nbsp;&nbsp;');
                var $toastContent = $(document.createElement('span'))
                    .text('Funding submitted to the Ethereum blockchain')
                    .add($link);

                Materialize.toast($toastContent, messageTimes.longer, colors.GREEN);
                updateTokens(ex.selectedAccount);
                document.getElementById("personalStash").style.opacity = 1;

                hideLoader();
            }).catch(function (err) {
                console.log('Error during BUY: ', err);
                var $link = $(document.createElement('a'))
                    .attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#readContract')
                    .attr('target', '_blank')
                    .attr('class', 'yellow-text toast-action')
                    .html('Inspect on EtherScan&nbsp;&nbsp;&nbsp;');
                var $toastContent = $(document.createElement('span'))
                    .text('Something went wrong. Please check if you\'re whitelisted.')
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

        function fillAccounts(accounts) {
            ex.accounts = accounts;

            $.each(ex.accounts, function (i, item) {
                var option = document.createElement('option');
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

                presaleContract.allowed.call(ex.selectedAccount).then(function (result) {
                    if (result === false) {
                        var errorMessage = 'Unable to fund from this address because it is not whitelisted.';
                        Materialize.toast(errorMessage, messageTimes.medium, colors.BLUE);
                    }
                });

                updateButtons();
            });
        }

        var updateTokens = async function (address) {
            try {
                let _tokens = await presaleContract.balanceOf.call(address);
                elements.$fndYourTokens.html(web3.fromWei(_tokens.toNumber()));
            } catch (error) {
                Materialize.toast('Please check your settings. The presale is not deployed on your current network.', messageTimes.medium);
                hidePresaleSection();
            }
        }

        var refreshContractInformation = async function () {
            try {
                console.log('refreshing');
                let _rate = await presaleContract.rate.call()
                elements.$fndCurrentRate.html(_rate.toNumber());

                let _weiRaised = (await presaleContract.weiRaised.call()).toNumber();
                let _weiMaxCap = (await presaleContract.weiMaxCap.call()).toNumber();
                let _wei = _weiMaxCap - _weiRaised;
                let ether = (_wei / Math.pow(10, 18));
                elements.$fndTotalRaised.html((Math.round((ether * 100) / 100)).toFixed(2) + ' ETH');

                let _investorCount = await presaleContract.investorCount.call();
                elements.$fndTotalBackers.html(_investorCount.toNumber() + 11);

                ex.owner = await presaleContract.owner.call();
                setTimeout(refreshContractInformation, 10000);
            } catch (error) {
                console.log(error);
                Materialize.toast('Please check your settings. The presale is not deployed on your current network.', messageTimes.medium);
                hidePresaleSection();
            }
        };

        function updateButtons() {
            var isConfirmTermsChecked = elements.checkboxes.$confirmTerms.is(':checked');
            var isAddressSelected = elements.$accountSelect.val() !== null;
            var isAmountNotNull = elements.$amount.val() > 0;

            if (isConfirmTermsChecked && isAddressSelected && isAmountNotNull) {
                enableButton(elements.buttons.$buy);
            } else {
                disableButton(elements.buttons.$buy);
            }
        }

        function fillContractAddress() {
            var $link = $(document.createElement('a'))
                .attr('href', 'https://etherscan.io/address/' + presaleContract.address + '#readContract')
                .attr('target', '_blank')
                .html(presaleContract.address);
            var $contractAddressLabelContent = $(document.createElement('span'))
                .text('The private seed contract is located at ')
                .add($link);

            elements.$contractAddressLabel.html($contractAddressLabelContent);
        }

        var start = function () {

            elements.$contractLocation.text(presaleContract.address);

            web3.eth.getAccounts(function (err, accounts) {
                refreshContractInformation();
                fillContractAddress();
                if (!accountsAreInvalid(err, accounts)) {
                    fillAccounts(accounts);
                }
            });
        };

        var init = function () {
            disableButton(elements.buttons.$buy);
            elements.buttons.$buy.on('click', buy);
            elements.buttons.$allow.on('click', allow);
            elements.checkboxes.$confirmTerms.on('click', updateButtons);
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
            presale.init();
        } else {
            window.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/mew'));
            showImmediateBuySection();
        }
    });

    function enableButton($button) {
        $button.removeClass('custom_btn').addClass('custom_teal');
    }

    function disableButton($button) {
        $button.removeClass('custom_teal').addClass('custom_btn');
    }

    // uncomment rule below when need for exposing the object globally
    // window.presale = presale;
})(jQuery);