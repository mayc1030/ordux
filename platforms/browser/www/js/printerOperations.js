/* global cordova, BTPrinter */
//https://github.com/CesarBalzer/Cordova-Plugin-BTPrinter?tab=readme-ov-file#Print-image-from-base64-with-align
function permissionsDevice() {
    var permissions = cordova.plugins.permissions;
    var permissionsList = [
        permissions.ACCESS_FINE_LOCATION,
        permissions.BLUETOOTH_CONNECT
    ];

    permissions.requestPermissions(
        permissionsList,
        function (status) {
            if (status.hasPermission) {
                console.log("Permisos concedidos.");
                // navigator.notification.alert(
                //     'Permisos concedidos.',
                //     null,
                //     'Éxito',
                //     'OK'
                // );
                listDevice()
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

function statusDevice() {
    BTPrinter.status(function (data) {
        console.log('status: ' + data);
        $('#statusPrinter').html('<span class="success">' + data + '</span>');
    }, function (err) {
        console.error('status: ' + err);
        $('#statusPrinter').html('<span class="error">' + err + '</span>');
    });
}


function listDevice() {
    BTPrinter.list(function (data) {
        console.log('list: success');
        $('#btpPrinter').empty().prop('disabled', false);
        $.each(data, function (idx, value) {
            if (idx % 3 === 0) {
                $('#btpPrinter').append('<option value="' + idx + '" data-name="' + data[idx] + '">' + data[idx] + ' (' + data[idx + 1] + ')</option>');
            }
        });
    }, function (err) {
        console.log("Error");
        console.log(err);
        navigator.notification.alert(
            'Error al solicitar permisos: ' + err,
            null,
            'Error',
            'OK'
        );
    });
}



function connect() {
    $('#connectDeviceButton').prop('disabled', true);
    window.setTimeout(function () {
        var strPrinter = $('#btpPrinter option:selected').attr('data-name');
        BTPrinter.connect(function (data) {
            $('#statusPrinter').html('<span class="success">' + data + '</span>');
            $('#btnConnect').prop('disabled', false);
        }, function (err) {
            navigator.notification.alert(
                'Error al conectar' + err,
                null,
                'Error',
                'OK'
            );
            $('#statusPrinter').html('<span class="error">' + err + '</span>');
            $('#btnConnect').prop('disabled', false);
        }, strPrinter);
    }, 100);
}



function connected() {
    BTPrinter.connected(function (data) {
        $('#statusPrinter').html('<span class="success">' + data + '</span>');
    }, function (err) {
        navigator.notification.alert(
            'Error al conectar' + err,
            null,
            'Error',
            'OK'
        );
        $('#statusPrinter').html('<span class="error">' + err + '</span>');
    });
}


function disconnect() {
    BTPrinter.disconnect(function (data) {
        $('#connectDeviceButton').prop('disabled', false);
        $('#statusPrinter').html('<span class="success">' + data + '</span>');
    }, function (err) {
        navigator.notification.alert(
            'Error al desconectar' + err,
            null,
            'Error',
            'OK'
        );
        $('#statusPrinter').html('<span class="error">' + err + '</span>');
    });
}


function printBase64() {
    if (localStorage.getItem('orden')) {
        orden = localStorage.getItem('orden');
        $('#txtBase64').text(orden);
    } setTimeout(function () {
        var printBase64 = $('#txtBase64').val();
        // var strAlign = $('#optAlign option:selected').val();
        var strAlign = 1;
        BTPrinter.printBase64(function (data) {
            localStorage.removeItem('orden')
            $('#statusPrinter').html('<span class="success">' + data + '</span>');
        }, function (err) {
            navigator.notification.alert(
                'Error al imprimir: ' + err,
                null,
                'Error',
                'OK'
            );
            $('#statusPrinter').html('<span class="error">' + err + '</span>');
        }, printBase64, strAlign);
    }, 100);

}

