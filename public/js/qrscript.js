  function onQRCodeScanned(scannedText) {
    // scannedTextMemo.value = scannedText;

    if (scannedText) {
      console.log(scannedText);
    }
  }

  //this function will be called when JsQRScanner is ready to use
  function JsQRScannerReady() {
    //create a new scanner passing to it a callback function that will be invoked when
    //the scanner succesfully scan a QR code
    var jbScanner = new JsQRScanner(onQRCodeScanned);
    //reduce the size of analyzed images to increase performance on mobile devices
    jbScanner.setSnapImageMaxSize(300);
    var scannerParentElement = document.getElementById("scanner");
    if (scannerParentElement) {
      //append the jbScanner to an existing DOM element
      jbScanner.appendTo(scannerParentElement);
    }
  }