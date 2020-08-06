var app = angular.module('myApp', ['ngClickCopy']);
app.controller('myCtrl', function ($scope, $http, $interval) {
  var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  // const {Transaction} = require('stellar-base');

  // Initial the account object
  $scope.account = {};
  $scope.selectedAccount = {};

  // Define the view elements
  $scope.showWalletInfo = false;
  $scope.showLoading = false;
  $scope.showWalletbtn = false;
  $scope.showSuccess = false;

  // Define the ShareTest information
  $scope.sharewon = new StellarSdk.Asset("ShareTEST", "GBMMVGV4BDIY2X3SKKH6OF2IYRKVO2EK4WVJRO3ZMTGQCBBK3NVXJ4QT");

  var timer = $interval(function () {
    sessionStorage.removeItem("SendAddress");
    if (sessionStorage.getItem("SendAddress")) {
      $scope.receiverAddress = sessionStorage.getItem("SendAddress");
      $scope.qrcam = false;
      $interval.cancel(timer);
    }
  }, 1000);

  // Check the balance every 10000ms
  var checker = $interval(function () {
    $scope.bind();
  }, 10000);

  timer.then(success, error);
  checker.then(success, error);

  function success() {
    console.log("done");
  }

  function error() {
    console.log("timer stopped");
  }

  function Decodeuint8arr(uint8array) {
    return new TextDecoder("utf8").decode(uint8array);
  }

  function Encodeuint8arr(myString) {
    return new TextEncoder("utf-8").encode(myString);
  }

  // Bind the selected account with current account
  $scope.bind = function () {
    if (localStorage.getItem("WalletSecret")) {
      var keypair = StellarSdk.Keypair.fromSecret(localStorage.getItem("WalletSecret"));
      $scope.selectedAccount.Address = keypair.publicKey();
      $scope.update(keypair);
    }
  }

  // Update the account information from blockchain ledger, especially the balance
  $scope.update = function (account) {
    if (account.publicKey()) {
      $http.get("https://horizon-testnet.stellar.org/accounts/" + account.publicKey())
        .then(function (response) {
          $scope.account = response.data;
          console.log($scope.account);
          return true;
        });
    }
  }

  // Function for sending XLM
  $scope.send = async function () {
    var sequence = $scope.account.sequence;
    var keypair = StellarSdk.Keypair.fromSecret($scope.selectedAccount.SecretKey);

    var source = new StellarSdk.Account(keypair.publicKey(), sequence);
    var transaction = new StellarSdk.TransactionBuilder(source, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: 'GAILUMSBNA4NS64HHY7YWRATDDYPCKXXBWV56ZKDNDIHLBBU2FFFGUZL',
        asset: StellarSdk.Asset.native(),
        amount: "350"
      }))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    console.log(transaction.toEnvelope().toXDR('base64'));

    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
      $scope.update();
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
      $scope.update();
    }
  }

  // Function for sending ShareTest
  $scope.sendShareWon = async function (sendAddress, sendAmount) {
    var sequence = $scope.account.sequence;
    var keypair = StellarSdk.Keypair.fromSecret(localStorage.getItem("WalletSecret"));

    var source = new StellarSdk.Account(keypair.publicKey(), sequence);
    var transaction = new StellarSdk.TransactionBuilder(source, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: sendAddress,
        asset: $scope.sharewon,
        amount: sendAmount.toString()
      }))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    console.log(transaction.toEnvelope().toXDR('base64'));

    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
      $scope.showSuccess = true;
      $scope.bind();
      sessionStorage.removeItem("SendAddress");
      $scope.receiverAddress = null;
      $scope.sendAmount = null;
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
      $scope.bind();
      sessionStorage.removeItem("SendAddress");
      $scope.receiverAddress = null;
      $scope.sendAmount = null;
    }
  }

  $scope.airdrop = async function (sendAddress, sendAmount) {
    var sequence = $scope.account.sequence;
    var keypair = StellarSdk.Keypair.fromSecret($scope.selectedAccount.SecretKey);

    var source = new StellarSdk.Account(keypair.publicKey(), sequence);
    var transaction = new StellarSdk.TransactionBuilder(source, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: sendAddress,
        asset: $scope.sharewon,
        amount: sendAmount
      }))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    console.log(transaction.toEnvelope().toXDR('base64'));

    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(JSON.stringify(transactionResult, null, 2));
      console.log('\nSuccess! View the transaction at: ');
      console.log(transactionResult._links.transaction.href);
      $scope.bind($scope.selectedAccount);
    } catch (e) {
      console.log('An error has occured:');
      console.log(e);
      $scope.bind($scope.selectedAccount);
    }
  }

  // Check if the account trusted ShareTest
  $scope.checkTrust = function () {
    server.loadAccount($scope.selectedAccount.PublicKey).then(function (account) {
      var trusted = account.balances.some(function (balance) {
        return balance.asset_code === $scope.sharewonCode &&
          balance.asset_issuer === $scope.sharewonIssuer;
      });

      console.log(trusted ? 'Trusted :)' : 'Not trusted :(');
    });
  }

  // Change the account to trust ShareTest
  $scope.changeTrust = function (changeAccount) {
    console.log("calling changeTrust()...");
    var keypair = StellarSdk.Keypair.fromSecret(changeAccount.secret());
    server.accounts()
      .accountId(changeAccount.publicKey())
      .call()
      .then(async ({ sequence }) => {
        const account = new StellarSdk.Account(changeAccount.publicKey(), sequence)
        const transaction = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET
        })
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: $scope.sharewon,
            source: changeAccount.publicKey()
          }))
          .setTimeout(30)
          .build();

        transaction.sign(keypair);
        // console.log(transaction.toEnvelope().toXDR('base64'));

        try {
          const transactionResult = await server.submitTransaction(transaction);
          // console.log(JSON.stringify(transactionResult, null, 2));
          console.log('\nSuccess! View the transaction at: ');
          console.log(transactionResult._links.transaction.href);
          $scope.showWalletbtn = true;
          $scope.$apply();
        } catch (e) {
          console.log('An error has occured:');
          console.log(e);
        }
      })
  }

  // Create new wallet account
  $scope.createAccount = function () {
    var sourceAccount = StellarSdk.Keypair.fromSecret("SBHFOFRLXJHCPI646BWFD6XHA3ECN7E5VMWI3HNKHFBM5POIDW5MVPGE")
    $scope.createdAccount = StellarSdk.Keypair.random()

    server.accounts()
      .accountId(sourceAccount.publicKey())
      .call()
      .then(({ sequence }) => {
        const account = new StellarSdk.Account(sourceAccount.publicKey(), sequence)
        const transaction = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET
        })
          .addOperation(StellarSdk.Operation.createAccount({
            destination: $scope.createdAccount.publicKey(),
            startingBalance: '25'
          }))
          .setTimeout(30)
          .build()
        transaction.sign(StellarSdk.Keypair.fromSecret(sourceAccount.secret()))
        return server.submitTransaction(transaction)
      })
      .then(async ({ results }) => {
        // console.log('Transaction', results._links.transaction.href)
        // console.log('New Keypair', $scope.createdAccount.publicKey(), $scope.createdAccount.secret())
        $scope.showWalletInfo = true;
        $scope.showLoading = false;
        $scope.$apply();
        localStorage.setItem("WalletAddress", $scope.createdAccount.publicKey());
        localStorage.setItem("WalletSecret", $scope.createdAccount.secret());
        await $scope.changeTrust($scope.createdAccount);
        await $scope.airdrop(sourceAccount);
      })
  }

  $scope.transactionHist = function () {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const accountId = 'GBZIR5RJE4WZUKI4YALXG2W6RVBTLZV5IIEX3PJHLLTMDRJ75UMJQIYG';

    server.transactions()
      .forAccount(accountId)
      .call()
      .then(function (page) {
        console.log('Page 1: ');
        console.log(page.records);
        $scope.XDRData = StellarSdk.xdr.TransactionEnvelope.fromXDR(page.records[3].envelope_xdr, 'base64');
        // $scope.XDRData = JSON.stringify(StellarSdk.xdr.TransactionEnvelope.fromXDR(page.records[3].envelope_xdr, 'base64'));
        console.log("PubKey: " + StellarSdk.StrKey.encodeEd25519PublicKey($scope.XDRData._value._attributes.tx._attributes.sourceAccountEd25519));
        // var lalala = new Transaction($scope.XDRData);
        console.log($scope.XDRData);
        return page.next();
      })
      .then(function (page) {
        console.log('Page 2: ');
        console.log(page.records);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  $scope.transtest = function () {
    $scope.StrKey = new StrKey();
    console.log($scope.StrKey);
  }

  // Goto wallet page after creation
  $scope.gotoMyWallet = function () {
    location.replace("wallet.html")
  }

  $scope.showCopy = function () {
    $scope.copied = true;
    setTimeout(function () {
      $scope.copied = false;
      $scope.$apply();
    }, 3000);
  }

  $scope.click = function () {
    console.log("Clicking");
  }

  $scope.bind();
  // $scope.transtest();
  $scope.transactionHist();
  // $scope.JsQRScannerReady();
  // $scope.update();
  // console.log($scope.sharewon);
});
