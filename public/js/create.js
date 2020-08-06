// This javascript contains main account private key,
// it for testing purpose and all the function will be on server side at production stage.

var app = angular.module('myApp', ['ngClickCopy']);
app.controller('myCtrl', function($scope, $http) {
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    $scope.account = {};
    $scope.LoadingWord = "We are creating the wallet for you.";

    // Define the ShareTest information
    $scope.sharewon = new StellarSdk.Asset("ShareTEST", "GBMMVGV4BDIY2X3SKKH6OF2IYRKVO2EK4WVJRO3ZMTGQCBBK3NVXJ4QT");

    // !---===Source Account need to keep it SAFE===---!
    $scope.sourceAccount = StellarSdk.Keypair.fromSecret("SBHFOFRLXJHCPI646BWFD6XHA3ECN7E5VMWI3HNKHFBM5POIDW5MVPGE");
    
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
            $scope.LoadingWord = "Sending ShareWon to you...";
            $scope.$apply();
            const transactionResult = await server.submitTransaction(transaction);
            console.log(JSON.stringify(transactionResult, null, 2));
            console.log('\nSuccess! View the transaction at: ');
            console.log(transactionResult._links.transaction.href);
            console.log("airdropped!!");
            $scope.bind();
            $scope.showLoading = false;
            $scope.showWalletbtn = true;
            $scope.$apply();
            return true;
        } catch (e) {
            console.log('An error has occured:');
            console.log(e);
            $scope.bind();
            return e;
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
            await $scope.airdrop(changeAccount.publicKey(), '20')
            return true;
          } catch (e) {
            console.log('An error has occured:');
            console.log(e);
            return e;
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
            localStorage.setItem("WalletAddress", createdAccount.publicKey());
            localStorage.setItem("WalletSecret", createdAccount.secret());
            await $scope.changeTrust(createdAccount);
          })
      }

          // Goto wallet page after creation
    $scope.gotoMyWallet = function() {
        location.replace("wallet.html")
      }

    $scope.bind();
});
