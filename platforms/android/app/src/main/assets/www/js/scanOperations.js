function scanCode() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Result: ' + result.text + '<br>Format: ' + result.format;
            saveScanResult(result);
        },
        function (error) {
            var resultDiv = document.getElementById('resultDiv');
            resultDiv.innerHTML = 'Scanning failed: ' + error;
        }
    );
}


///storage/emulated/0/Android/data/[com.tu.paquete]/files/
function saveScanResult(result) {
    var scanData = {
        text: result.text,
        format: result.format
    };

    var fileName = 'scanResult.json';

    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function () {
                    var fileContent;
                    if (this.result) {
                        fileContent = JSON.parse(this.result);
                    } else {
                        fileContent = [];
                    }

                    // Verifica si el código ya existe
                    var codeExists = fileContent.some(function (item) {
                        return item.text === scanData.text && item.format === scanData.format;
                    });

                    if (!codeExists) {
                        fileContent.push(scanData);
                        var dataObj = new Blob([JSON.stringify(fileContent)], { type: 'application/json' });

                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.write(dataObj);
                            navigator.notification.alert(
                                'Resultado del escaneo guardado en scanResult.json',
                                null,
                                'Éxito',
                                'OK'
                            );
                        });
                    } else {
                        navigator.notification.alert(
                            'El código ya existe en scanResult.json',
                            null,
                            'Info',
                            'OK'
                        );
                    }
                };

                reader.readAsText(file);
            }, function () {
                // Si el archivo está vacío o no existe, crea un nuevo array
                var fileContent = [scanData];
                var dataObj = new Blob([JSON.stringify(fileContent)], { type: 'application/json' });

                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.write(dataObj);
                    navigator.notification.alert(
                        'Resultado del escaneo guardado en scanResult.json',
                        null,
                        'Éxito',
                        'OK'
                    );
                });
            });
        });
    });
}


function scan_create_product() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var skuField = document.getElementById('field-sku-product');
            skuField.value = result.text;
        },
        function (error) {
            navigator.notification.alert(
                'Error al scanear ' + error,
                null,
                'Éxito',
                'OK'
            );
        }
    );
}


function scan_find_product() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var scanButton = document.getElementById('scan_find_product_button');
            scanButton.setAttribute('data-barcode', result.text);
        },
        function (error) {
            navigator.notification.alert(
                'Error al scanear ' + error,
                null,
                'Éxito',
                'OK'
            );
        }
    );
}
