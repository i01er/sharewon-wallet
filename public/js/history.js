var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
  // Define the ShareTest information
  $scope.sharewon = new StellarSdk.Asset("ShareTest", "GCGL3JX5UBHPGZHYRBWKB7G4LKSCCCPD34DGLK7MG2EZPBYUJLBB3TZ2");
  $scope.history = [];

  function Decodeuint8arr(uint8array) {
    return new TextDecoder("utf8").decode(uint8array);
  }

  // Update the account information from blockchain ledger, especially the balance
  $scope.update = function (address) {
    if (address) {
      $http.get("https://horizon-testnet.stellar.org/accounts/" + address)
        .then(function (response) {
          $scope.account = response.data;
        });
    }
  }

  $scope.transactionHist = function () {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const accountId = localStorage.getItem("WalletAddress");

    server.transactions()
      .forAccount(accountId)
      .limit(200)
      .call()
      .then(function (page) {
        // console.log('Page 1: ');
        // console.log(page.records);
        for (i in page.records) {
          $scope.XDRData = StellarSdk.xdr.TransactionEnvelope.fromXDR(page.records[i].envelope_xdr, 'base64');
          if($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.asset) {
            var tempobj = {};
            tempobj.destination = StellarSdk.StrKey.encodeEd25519PublicKey($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.destination._value);
            tempobj.amount = $scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.amount.low/10000000;
            tempobj.assetCode = Decodeuint8arr($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.asset._value._attributes.assetCode);
            if(tempobj.destination == accountId) {
              tempobj.type = "Receive";
            } else {
              tempobj.type = "Send";
            }
            $scope.history.push(tempobj);
            // if($scope.XDRData._value._attributes.tx._attributes.sourceAccountEd25519) {
            //   console.log("[" + i + "]" + StellarSdk.StrKey.encodeEd25519PublicKey($scope.XDRData._value._attributes.tx._attributes.sourceAccountEd25519));
            // }
            // console.log(StellarSdk.StrKey.encodeEd25519PublicKey($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.destination._value));
            // console.log($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.destination._value);
            // console.log($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.amount.low/10000000);
            // console.log(Decodeuint8arr($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.asset._value._attributes.assetCode));
          }
        }
        console.log($scope.history);
        $scope.$apply();
        return true;
        // return page.next();
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  $scope.transactionHist();
});