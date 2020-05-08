var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {
  // Define the ShareTest information
  $scope.sharewon = new StellarSdk.Asset("ShareTest", "GCGL3JX5UBHPGZHYRBWKB7G4LKSCCCPD34DGLK7MG2EZPBYUJLBB3TZ2");

  // Update the account information from blockchain ledger, especially the balance
  $scope.update = function (address) {
    if (address) {
      $http.get("https://horizon-testnet.stellar.org/accounts/" + address)
        .then(function (response) {
          $scope.account = response.data;
        });
    }
  }

  function Decodeuint8arr(uint8array) {
    return new TextDecoder("utf-8").decode(uint8array);
  }

  function Encodeuint8arr(myString) {
    return new TextEncoder("utf-8").encode(myString);
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
        console.log(Decodeuint8arr($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.asset._value._attributes.assetCode));
        // console.log(Decodeuint8arr($scope.XDRData._value._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.asset._value._attributes.issuer._value));
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

  $scope.transactionHist();
});