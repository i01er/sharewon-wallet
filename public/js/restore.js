var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $http) {

  $scope.restore = function () {
    if($scope.inputSecret) {
      $scope.inputAccount = StellarSdk.Keypair.fromSecret($scope.inputSecret);
      console.log($scope.inputAccount);
    }
  }

  $scope.confirm = function () {
    localStorage.setItem("WalletAddress", $scope.inputAccount.publicKey());
    localStorage.setItem("WalletSecret", $scope.inputAccount.secret());
    $scope.message = "Wallet Restored";
  }

  $scope.gotoMyWallet = function() {
    location.replace("wallet.html")
  }

});