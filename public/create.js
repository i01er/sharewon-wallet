// This javascript contains main account private key,
// it for testing purpose and all the function will be on server side at production stage.

var app = angular.module('myApp', ['ngClickCopy']);
app.controller('myCtrl', function($scope, $http) {
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    $scope.account = {};

    // Define the ShareTest information
    $scope.sharewon = new StellarSdk.Asset("ShareTest", "GAILUMSBNA4NS64HHY7YWRATDDYPCKXXBWV56ZKDNDIHLBBU2FFFGUZL");

    // !---===Source Account need to keep it SAFE===---!
    $scope.sourceAccount = StellarSdk.Keypair.fromSecret('SB42ERIDWT5MEFDNPH4YXMENCLCCTIYNXXSOTCTEZ3S4ELFW5GU7QT4D');
    
    // Bind the selected account with current account
    $scope.bind = function() {
        if(localStorage.getItem("WalletSecret")) {
            $scope.keypair = StellarSdk.Keypair.fromSecret(localStorage.getItem("WalletSecret"));
            // $scope.selectedAccount.Address = $scope.keypair.publicKey();
            $scope.account = $scope.update($scope.keypair);
            console.log($scope.keypair.publicKey());
        } else {
            $scope.keypair = {};
            $scope.account = $scope.update($scope.sourceAccount);
            // console.log($scope.keypair.publicKey());
        }
      }
  
      // Update the account information from blockchain ledger, especially the balance
    $scope.update = function(account) {
        if(account.publicKey()) {
          $http.get("https://horizon-testnet.stellar.org/accounts/" + account.publicKey())
          .then(function(response) {
              console.log(response.data);
              return response.data;
          });
        }
      }
  
      // Function for sending ShareTest
    $scope.sendShareWon = async function(keypair, sendAddress, sendAmount) {
        var sequence = $scope.account.sequence;
      
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
            $scope.update(keypair);
        
        } catch (e) {
            console.log('An error has occured:');
            console.log(e);
            $scope.update(keypair);
        }
      }
  
      // Airdrop ShareTest to the new created user
    $scope.airdrop = async function(sendAddress, sendAmount) {
        console.log("calling airdrop...");
        server.accounts()
          .accountId($scope.sourceAccount.publicKey())
          .call()
          .then(async ({ sequence }) => {
            const account = new StellarSdk.Account($scope.sourceAccount.publicKey(), sequence)
            const transaction = new StellarSdk.TransactionBuilder(account, {
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
      
        transaction.sign($scope.sourceAccount);
        console.log(transaction.toEnvelope().toXDR('base64'));
  
        try {
            console.log("call airdrop try");
            const transactionResult = await server.submitTransaction(transaction);
            console.log(JSON.stringify(transactionResult, null, 2));
            console.log('\nSuccess! View the transaction at: ');
            console.log(transactionResult._links.transaction.href);
            console.log("airdropped!!");
            $scope.bind();
            $scope.showWalletbtn = true;
            // $scope.$apply();
        } catch (e) {
            console.log('An error has occured:');
            console.log(e);
            $scope.bind();
        }
        })
      }
  
      // Check if the account trusted ShareTest
    $scope.checkTrust = function(account) {
        server.loadAccount(account.publicKey()).then(function(account) {
          var trusted = account.balances.some(function(balance) {
            return balance.asset_code === $scope.sharewonCode &&
                   balance.asset_issuer === $scope.sharewonIssuer;
          });
        
          console.log(trusted ? 'Trusted ShareTest' : 'Not trusted ShareTest');
        });
      }
  
      // Change the account to trust ShareTest
    $scope.changeTrust = async function(changeAccount) {
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
            console.log("call changeTrust try");
            const transactionResult = await server.submitTransaction(transaction);
            // console.log(JSON.stringify(transactionResult, null, 2));
            console.log('\nSuccess! View the transaction at: ');
            console.log(transactionResult._links.transaction.href);
            return true;
          } catch (e) {
            console.log('An error has occured:');
            console.log(e);
          }
        })
      }
  
      // Create new wallet account
    $scope.createAccount = function() {
        var createdAccount = StellarSdk.Keypair.random()
  
        server.accounts()
          .accountId($scope.sourceAccount.publicKey())
          .call()
          .then(({ sequence }) => {
            const account = new StellarSdk.Account($scope.sourceAccount.publicKey(), sequence)
            const transaction = new StellarSdk.TransactionBuilder(account, {
              fee: StellarSdk.BASE_FEE,
              networkPassphrase: StellarSdk.Networks.TESTNET
            })
              .addOperation(StellarSdk.Operation.createAccount({
                destination: createdAccount.publicKey(),
                startingBalance: '25'
              }))
              .setTimeout(30)
              .build()
            transaction.sign($scope.sourceAccount)
            return server.submitTransaction(transaction)
          })
          .then(async ({results}) => {
            // console.log('Transaction', results._links.transaction.href);
            console.log("account created");
            console.log('New Keypair', createdAccount.publicKey(), createdAccount.secret());
            $scope.showWalletInfo = true;
            $scope.showLoading = false;
            $scope.$apply();
            localStorage.setItem("WalletAddress", createdAccount.publicKey());
            localStorage.setItem("WalletSecret", createdAccount.secret());
            await Promise.all([$scope.changeTrust(createdAccount), $scope.airdrop(createdAccount.publicKey(), '100')]);
            // await $scope.changeTrust(createdAccount);
            // await $scope.airdrop(createdAccount.publicKey(), '100');
          })
      }

          // Goto wallet page after creation
    $scope.gotoMyWallet = function() {
        location.replace("wallet.html")
      }

    $scope.bind();
});