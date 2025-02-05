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


function allPermission() {
    var permissions = cordova.plugins.permissions;
    var permissionsList = [
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_EXTERNAL_STORAGE
    ];

    permissions.requestPermissions(
        permissionsList,
        function(status) {
            if (status.hasPermission) {
                console.log("Permisos básicos concedidos.");
                
                // Verifica y solicita el permiso MANAGE_EXTERNAL_STORAGE en Android 11+
                if (cordova.platformId === 'android' && parseInt(device.version) >= 11) {
                    cordova.plugins.permissions.checkPermission(permissions.MANAGE_EXTERNAL_STORAGE, function(status) {
                        if (!status.hasPermission) {
                            cordova.plugins.permissions.requestPermission(permissions.MANAGE_EXTERNAL_STORAGE, function(status) {
                                if (status.hasPermission) {
                                    console.log("Permiso de acceso total concedido.");
                                    navigator.notification.alert(
                                        'Permiso de acceso total concedido.',
                                        null,
                                        'Éxito',
                                        'OK'
                                    );
                                } else {
                                    console.error("Permiso de acceso total denegado.");
                                    navigator.notification.alert(
                                        'Permiso de acceso total denegado:',
                                        null,
                                        'Error',
                                        'OK'
                                    );
                                }
                            }, function(error) {
                                console.error("Error al solicitar el permiso: " + error.toString());
                                navigator.notification.alert(
                                    'Error al solicitar el permiso:',
                                    null,
                                    'Error',
                                    'OK'
                                );
                            });
                        } else {
                            console.log("Ya tienes el permiso de acceso total.");
                            navigator.notification.alert(
                                'Ya tienes el permiso de acceso total.',
                                null,
                                'Éxito',
                                'OK'
                            );
                        }
                    }, function(error) {
                        console.error("Error al verificar el permiso: " + error.toString());
                        navigator.notification.alert(
                            'Error al verificar el permiso:',
                            null,
                            'Error',
                            'OK'
                        );
                    });
                } else {
                    saveFile(); // Llama a la función saveFile si no se requiere MANAGE_EXTERNAL_STORAGE
                }
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
        function(error) {
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

function shareZip() {
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


function allPermission() {
    var fileName = "example.txt";
    var fileContent = "Este es un archivo de texto de ejemplo.";
    var directory = cordova.file.externalRootDirectory + "Download/";
    var folderName = "MyFolder/"; // Nombre de la carpeta que deseas crear

    // Primero, accede al directorio "Download/"
    window.resolveLocalFileSystemURL(directory, function(dir) {
        // Luego, crea la nueva carpeta dentro de "Download/"
        dir.getDirectory(folderName, { create: true, exclusive: false }, function(folderEntry) {
            // Ahora, accede a la carpeta recién creada y crea el archivo en ella
            folderEntry.getFile(fileName, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    var dataObj = new Blob([fileContent], { type: 'text/plain' });

                    fileWriter.write(dataObj);

                    fileWriter.onwriteend = function() {
                        console.log("Archivo escrito correctamente en: " + fileEntry.fullPath);
                    };

                    fileWriter.onerror = function(e) {
                        console.error("Fallo al escribir el archivo: " + e.toString());
                    };
                });
            }, function(error) {
                console.error("Error al crear o abrir el archivo: " + error.toString());
            });
        }, function(error) {
            console.error("Error al crear la carpeta: " + error.toString());
        });
    }, function(error) {
        console.error("Error al acceder a la carpeta de Descargas: " + error.toString());
    });
}



function backupDatabase() {
    var fileName = 'ordux_backup.db';
    var sourcePath = cordova.file.applicationStorageDirectory + 'databases/ordux.db';
    var targetPath = cordova.file.externalRootDirectory + 'Download/';

    window.resolveLocalFileSystemURL(sourcePath, function(fileEntry) {
        window.resolveLocalFileSystemURL(targetPath, function(dirEntry) {
            fileEntry.copyTo(dirEntry, fileName, function() {
                console.log('Database backup successful!');
                navigator.notification.alert(
                    'Database backup successful!',
                    null,
                    'Success',
                    'OK'
                );
            }, function(error) {
                console.error('Error copying database file:', error);
                navigator.notification.alert(
                    'Error copying database file: ' + error.code,
                    null,
                    'Error',
                    'OK'
                );
            });
        }, function(error) {
            console.error('Error accessing target directory:', error);
            navigator.notification.alert(
                'Error accessing target directory: ' + error.code,
                null,
                'Error',
                'OK'
            );
        });
    }, function(error) {
        console.error('Error finding source database file:', error);
        navigator.notification.alert(
            'Error finding source database file: ' + error.code,
            null,
            'Error',
            'OK'
        );
    });
}





function errorHandler(error) {
    console.error('Error: ', error);
    navigator.notification.alert(
        'Error: ' + error.message,
        null,
        'Error',
        'OK'
    );
}