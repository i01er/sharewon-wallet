var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
    // Define the ShareTest information
    $scope.sharewon = new StellarSdk.Asset("ShareTest", "GAILUMSBNA4NS64HHY7YWRATDDYPCKXXBWV56ZKDNDIHLBBU2FFFGUZL");

    // Update the account information from blockchain ledger, especially the balance
    $scope.update = function(address) {
      if(address) {
        $http.get("https://horizon-testnet.stellar.org/accounts/" + address)
        .then(function(response) {
            $scope.account = response.data;
        });
      }
    }
});