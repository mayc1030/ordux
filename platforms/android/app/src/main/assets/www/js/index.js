document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    // Añadir el listener al botón
    var readFileButton = document.getElementById('readFileButton');
    if (readFileButton) {
        readFileButton.addEventListener('click', readFile);
    }

    var createFileButton = document.getElementById('createFileButton');
    if (createFileButton) {
        createFileButton.addEventListener('click', createFile);
    }


    var compressFileButton = document.getElementById('compressFileButton');
    if (compressFileButton) {
        compressFileButton.addEventListener('click', compressFile);
    }


    var sharedFileButton = document.getElementById('sharedFileButton');
    if (sharedFileButton) {
        sharedFileButton.addEventListener('click', shareZip);
    }


    var scanButton = document.getElementById('scanButton');
    if (scanButton) {
        scanButton.addEventListener('click', function () {
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
        });
    }


    var takePhotoButton = document.getElementById('takePhotoButton');
    if (takePhotoButton) {
        takePhotoButton.addEventListener('click', takePhoto);
    }


    var selectPhotoButton = document.getElementById('selectPhotoButton');
    if (selectPhotoButton) {
        selectPhotoButton.addEventListener('click', selectPhoto);
    }


    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}


function createFile() {
    var permissions = cordova.plugins.permissions;
    var permissionsList = [
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_EXTERNAL_STORAGE
    ];

    permissions.requestPermissions(
        permissionsList,
        function (status) {
            if (status.hasPermission) {
                console.log("Permisos concedidos.");
                navigator.notification.alert(
                    'Permisos concedidos.',
                    null,
                    'Éxito',
                    'OK'
                );
                saveFile();
                //saveFileCustom();
            } else {
                console.log("Permiso denegado para escribir/leer en el almacenamiento externo.");
                navigator.notification.alert(
                    'Permiso denegado para escribir/leer en el almacenamiento externo.',
                    null,
                    'Error',
                    'OK'
                );
            }
        },
        function (error) {
            console.log("Error al solicitar permisos: " + error);
            navigator.notification.alert(
                'Error al solicitar permisos: ' + error,
                null,
                'Error',
                'OK'
            );
        }
    );
}
function saveFileCustom() {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (rootDirEntry) {
        // Crea un nuevo directorio dentro del almacenamiento externo
        rootDirEntry.getDirectory("myCustomDirectory", { create: true, exclusive: false }, function (dirEntry) {
            console.log("Directorio creado con éxito: " + dirEntry.nativeURL);

            // Crea un nuevo archivo dentro del nuevo directorio
            dirEntry.getFile("example.txt", { create: true, exclusive: false }, function (fileEntry) {
                console.log("Archivo creado con éxito: " + fileEntry.nativeURL);
                navigator.notification.alert(
                    'Archivo creado con éxito:' + fileEntry.nativeURL,
                    null,
                    'Éxito',
                    'OK'
                );

                // Escribe contenido en el archivo
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                        console.log("Escritura en el archivo completada.");
                        navigator.notification.alert(
                            'Escritura en el archivo completada',
                            null,
                            'Éxito',
                            'OK'
                        );
                    };
                    fileWriter.onerror = function (e) {
                        console.log("Error al escribir en el archivo: " + e.toString());
                    };

                    // Escribe datos en el archivo
                    fileWriter.write("Este es un archivo de ejemplo.");
                });
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}


function saveFile() {
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
        directoryEntry.getFile('file.txt', { create: true, exclusive: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                var dataObj = new Blob(['Hello, world!'], { type: 'text/plain' });
                fileWriter.write(dataObj);
                navigator.notification.alert(
                    'archivo creado.' + fileEntry.nativeURL,
                    null,
                    'Éxito',
                    'OK'
                );
                //readFile();
            });
        });
    });
}

function readFile() {
    var fileName = 'file.txt';
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
        directoryEntry.getFile(fileName, { create: false }, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function () {
                    console.log('Archivo leído: ' + this.result);
                    navigator.notification.alert(
                        'Archivo leído: ' + this.result,
                        null,
                        'Éxito',
                        'OK'
                    );
                };

                reader.readAsText(file);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}



function compressFile() {
    var sourcePath = cordova.file.externalDataDirectory + 'file.txt';

    navigator.notification.alert(
        'Archivo ZIP guardado correctamente ' + sourcePath,
        null,
        'Éxito',
        'OK'
    );

    var zip = new JSZip();

    window.resolveLocalFileSystemURL(sourcePath, function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function () {
                zip.file("file.txt", this.result);
                zip.generateAsync({ type: "blob" }).then(function (content) {
                    saveZip(content);
                });
            };

            reader.readAsArrayBuffer(file);
        });
    }, function (error) {
        console.error("Error resolviendo el archivo: ", error);
        errorHandler(error);
    });

}


function saveZip(zipBlob) {
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
        directoryEntry.getFile("myfile.zip", { create: true, exclusive: false }, function (zipEntry) {
            zipEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    console.log("Archivo ZIP guardado correctamente.");
                    navigator.notification.alert(
                        'Archivo ZIP guardado correctamente ',
                        null,
                        'Éxito',
                        'OK'
                    );
                };

                fileWriter.onerror = function (e) {
                    console.error("Error al guardar el archivo ZIP: ", e);
                    errorHandler(e);
                };

                fileWriter.write(zipBlob);
            });
        }, function (error) {
            console.error("Error obteniendo el archivo ZIP: ", error);
            errorHandler(error);
        });
    }, function (error) {
        console.error("Error resolviendo el sistema de archivos: ", error);
        errorHandler(error);
    });
}


function shareZip(zipFilePath) {
    var sourcePath = cordova.file.externalDataDirectory + 'myfile.zip';
    window.plugins.socialsharing.share(
        'Here is my ZIP file', // Message
        'My ZIP file', // Subject
        sourcePath, // File to share
        null, // URL
        function () {
            console.log('Share successful');
            navigator.notification.alert(
                'Se compartio el archivo ',
                null,
                'Éxito',
                'OK'
            );
        },
        function (errormsg) {
            console.error('Error sharing: ', errormsg);
            errorHandler(errormsg)
        }
    );
}


// function saveScanResult(result) {

//     var scanData = {
//         text: result.text,
//         format: result.format
//     };

//     navigator.notification.alert(
//         'codigo'+,
//         null,
//         'Éxito',
//         'OK'
//     );

//     window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
//         directoryEntry.getFile('scanResult.json', { create: true, exclusive: false }, function (fileEntry) {
//             fileEntry.createWriter(function (fileWriter) {
//                 var dataObj = new Blob([JSON.stringify(scanData)], { type: 'application/json' });
//                 fileWriter.write(dataObj);
//                 navigator.notification.alert(
//                     'Resultado del escaneo guardado en scanResult.json',
//                     null,
//                     'Éxito',
//                     'OK'
//                 );
//             });
//         });
//     });
// }


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

function takePhoto() {

    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 20,
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        targetWidth: 800, // Redimensionar la imagen
        targetHeight: 600, // Redimensionar la imagen
    });
}


function selectPhoto() {
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 20,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.DATA_URL,
        targetWidth: 800, // Redimensionar la imagen
        targetHeight: 600, // Redimensionar la imagen
    });
}

function onPhotoDataSuccess(imageData) {

    try {
        // Verificar si imageData está definido y no está vacío
        if (imageData) {
          
            var imageBase64 = "data:image/jpeg;base64," + imageData;

            var imgElement = document.getElementById('capturedImage');
            if (imgElement) {
                imgElement.src = imageBase64;
            } else {
                // Si el elemento <img> no existe, crearlo
                imgElement = document.createElement('img');
                imgElement.id = 'capturedImage';
                imgElement.src = imageBase64;
                document.body.appendChild(imgElement);
            }

            // navigator.notification.alert(
            //     imageBase64,
            //     null,
            //     'Imagen en Base64',
            //     'OK'
            // );
        } else {
            throw new Error("Datos de la imagen no válidos");
        }
    } catch (error) {
        console.error("Error al mostrar la imagen en base64: ", error);
        navigator.notification.alert(
            'Error al mostrar la imagen en base64: ' + error.message,
            null,
            'Error',
            'OK'
        );
    }
    
}

function onFail(message) {
    navigator.notification.alert(
        'Error: ',
        null,
        'Error',
        'OK'
    );
}


function errorHandler(error) {
    console.log('Error: ' + error.code);
    navigator.notification.alert(
        'Error: ' + error.code,
        null,
        'Error',
        'OK'
    );
}