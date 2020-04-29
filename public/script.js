var app = angular.module('myApp', ['ngClickCopy']);
app.controller('myCtrl', function($scope, $http, $location) {
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    // Initial the account object
    $scope.account = {};
    $scope.selectedAccount = {};
    
    // Define the view elements
    $scope.showWalletInfo = false;
    $scope.showLoading = false;
    $scope.showWalletbtn = false;
    
    // Define the ShareTest information
    $scope.sharewon = new StellarSdk.Asset("ShareTest", "GAILUMSBNA4NS64HHY7YWRATDDYPCKXXBWV56ZKDNDIHLBBU2FFFGUZL");

    // Bind the selected account with current account
    $scope.bind = function() {
      if(localStorage.getItem("WalletSecret")) {
        var keypair = StellarSdk.Keypair.fromSecret(localStorage.getItem("WalletSecret"));
        $scope.selectedAccount.Address = keypair.publicKey();
        $scope.update(keypair);
      }
    }

    // Update the account information from blockchain ledger, especially the balance
    $scope.update = function(account) {
      if(account.publicKey()) {
        $http.get("https://horizon-testnet.stellar.org/accounts/" + account.publicKey())
        .then(function(response) {
            $scope.account = response.data;
            console.log($scope.account);
            return true;
        });
      }
    }

    // Function for sending XLM
    $scope.send = async function() {
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
    $scope.sendShareWon = async function(sendAddress, sendAmount) {
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

    $scope.airdrop = async function(sendAddress, sendAmount) {
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
    $scope.checkTrust = function() {
      server.loadAccount($scope.selectedAccount.PublicKey).then(function(account) {
        var trusted = account.balances.some(function(balance) {
          return balance.asset_code === $scope.sharewonCode &&
                 balance.asset_issuer === $scope.sharewonIssuer;
        });
      
        console.log(trusted ? 'Trusted :)' : 'Not trusted :(');
      });
    }

    // Change the account to trust ShareTest
    $scope.changeTrust = function(changeAccount) {
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
    $scope.createAccount = function() {
      var sourceAccount = StellarSdk.Keypair.fromSecret('SB42ERIDWT5MEFDNPH4YXMENCLCCTIYNXXSOTCTEZ3S4ELFW5GU7QT4D')
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
        .then(async ({results}) => {
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

    // Goto wallet page after creation
    $scope.gotoMyWallet = function() {
      location.replace("wallet.html")
    }

    $scope.showCopy = function() {
      $scope.copied = true;
      setTimeout(function(){
        $scope.copied = false;
        $scope.$apply();
      },3000);
    }

    $scope.bind();
    // $scope.update();
    // console.log($scope.sharewon);
});