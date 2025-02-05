document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {


    if (window.sqlitePlugin) {
        const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

        // Crea la tabla si no existe
        db.transaction(tx => {
            tx.executeSql(`
				CREATE TABLE IF NOT EXISTS productos (
					id INTEGER PRIMARY KEY,
                    image TEXT NOT NULL,
                    name TEXT NOT NULL,
                    sale_price INTEGER NOT NULL,
                    purchase_price INTEGER NOT NULL,
                    sku TEXT,
                    bar_code TEXT,
                    stock INTEGER NOT NULL,
                    type TEXT,
			        category TEXT NOT NULL	
				);
			`);
        });


        // JSON de ejemplo
        const productos = [
            { "id": 111, "image": "./img/producttest.jpg", "name": "ABADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 222, "image": "./img/producttest.jpg", "name": "xxNEGRONI DE LA MONTAÑA", "sale_price": 82000, "purchase_price": 20000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "producto", "category": "Cocteles" },
            { "id": 333, "image": "./img/producttest.jpg", "name": "BADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 444, "image": "./img/producttest.jpg", "name": "BBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 555, "image": "./img/producttest.jpg", "name": "CBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 666, "image": "./img/producttest.jpg", "name": "DBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 777, "image": "./img/producttest.jpg", "name": "EBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 888, "image": "./img/producttest.jpg", "name": "FBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
            { "id": 999, "image": "./img/producttest.jpg", "name": "GBADA", "sale_price": 20000, "purchase_price": 18000, "sku": "abc123", "bar_code": "123456789", "stock": "8", "type": "insumo", "category": "Cocteles" },
        ];

        // Inserta los datos
        db.transaction(tx => {
            productos.forEach(producto => {
                tx.executeSql(`
					INSERT OR REPLACE INTO productos (id, image, name, sale_price, purchase_price, sku, bar_code, stock, type, category ) 
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
				`, [producto.id, producto.image, producto.name, producto.sale_price, producto.purchase_price, producto.sku, producto.bar_code, producto.stock, producto.type, producto.category]);
            });
        });

    } else {
        console.error('El plugin SQLite no está disponible');
    }



    // Simular clic en el primer tab
    setTimeout(function () {
        $('.tab').first().click();

    }, 100);

    tabs();


    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
}



// function tabs() {
//     $('.tab').click(function (event) {
//         event.preventDefault();

//         var text_section = $(this).text();
//         var url = $(this).data('load');


//         $('#content').load(url, function () {
//             $('.tab-content').addClass('show');
//             $('#content').find('#' + url.split('.')[0]).addClass('show');

//             // Reasigna los event listeners a los nuevos elementos cargados

//             assignEventListeners();

//             // Marca el dispositivo como listo
//             var deviceReadyElement = document.getElementById('deviceready');
//             if (deviceReadyElement) {
//                 deviceReadyElement.classList.add('ready');
//             }

//             if (isMenuOpen) {
//                 menuToggle.click();  // Solo cerrar el menú si está abierto
//             }

//             var breadcrumbDiv = document.getElementById('breadcrumb');
//             breadcrumbDiv.innerHTML = text_section;

//             if (url === 'reports.html') {
//                 initializeChart();
//             }


//             if (url === 'products.html') {
//                 initializeListProducts();
//             }


//             if (url === 'orders.html') {
//                 initializeOrders();
//             }


//         });

//         $('.tab').removeClass('active');
//         $(this).addClass('active');
//     });
// }


function tabs() {
    $('.tab').click(function (event) {
        event.preventDefault();

        var text_section = $(this).text();
        var url = $(this).data('load');

        // Aplica la clase de desvanecimiento
        $('#content').removeClass('fade-in').addClass('fade-out');

        // Espera que la animación se complete antes de cargar el contenido
        setTimeout(function () {
            $('#content').load(url, function () {
                $('#content').removeClass('fade-out').addClass('fade-in');
                $('.tab-content').addClass('show');
                $('#content').find('#' + url.split('.')[0]).addClass('show');

                // Reasigna los event listeners a los nuevos elementos cargados
                assignEventListeners();

                // Marca el dispositivo como listo
                var deviceReadyElement = document.getElementById('deviceready');
                if (deviceReadyElement) {
                    deviceReadyElement.classList.add('ready');
                }

                if (isMenuOpen) {
                    menuToggle.click();  // Solo cerrar el menú si está abierto
                }

                var breadcrumbDiv = document.getElementById('breadcrumb');
                breadcrumbDiv.innerHTML = text_section;

                if (url === 'reports.html') {
                    loadChartData();
                    // initializeChart();
                }

                if (url === 'products.html') {
                    initializeListProducts();
                }

                if (url === 'orders.html') {
                    initializeOrders();
                }
            });

            $('.tab').removeClass('active');
            $(this).addClass('active');
        }.bind(this), 200); // El tiempo debe coincidir con la duración de la transición en CSS
    });
}


function assignEventListeners() {


    // GET IP
    var getIpButton = document.getElementById('getIpButton');
    if (getIpButton) {
        getIpButton.addEventListener('click', getIp);
    }


    // BACKUP BD
    var backupButton = document.getElementById('backupButton');
    if (backupButton) {
        backupButton.addEventListener('click', backupDatabase);
    }

    //

    var backSectionHomeButton = document.getElementById('btn-back-section-home');
    if (backSectionHomeButton) {
        backSectionHomeButton.addEventListener('click', backSectionHome);
    }


    var allpermissionsButton = document.getElementById('allpermissionsButton');
    if (allpermissionsButton) {
        allpermissionsButton.addEventListener('click', allPermission);
    }


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
        scanButton.addEventListener('click', scanCode);
    }

    var scanButton = document.getElementById('scan_create_product_button');
    if (scanButton) {
        scanButton.addEventListener('click', scan_create_product);
    }




    var takePhotoButton = document.getElementById('takePhotoButton');
    if (takePhotoButton) {
        takePhotoButton.addEventListener('click', takePhoto);
    }

    var selectPhotoButton = document.getElementById('selectPhotoButton');
    if (selectPhotoButton) {
        selectPhotoButton.addEventListener('click', selectPhoto);
    }

    var statusDeviceButton = document.getElementById('statusDeviceButton');
    if (statusDeviceButton) {
        statusDeviceButton.addEventListener('click', statusDevice);
    }

    var listDevicesButton = document.getElementById('listDevicesButton');
    if (listDevicesButton) {
        listDevicesButton.addEventListener('click', permissionsDevice);
    }

    var connectDeviceButton = document.getElementById('connectDeviceButton');
    if (connectDeviceButton) {
        connectDeviceButton.addEventListener('click', connect);
    }

    var connectedDeviceButton = document.getElementById('connectedDeviceButton');
    if (connectedDeviceButton) {
        connectedDeviceButton.addEventListener('click', connected);
    }

    var disconnectDeviceButton = document.getElementById('disconnectDeviceButton');
    if (disconnectDeviceButton) {
        disconnectDeviceButton.addEventListener('click', disconnect);
    }


    var printBase64Button = document.getElementById('printBase64Button');
    if (printBase64Button) {
        printBase64Button.addEventListener('click', printBase64);
    }


    //PRODUCTO
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', handleKeyPress);
    }


    // BOTONES AGREGAR PRODUCTO


    var backSectionProductButton = document.getElementById('btn-back-section-product');
    if (backSectionProductButton) {
        backSectionProductButton.addEventListener('click', backSectionButton);
    }

    var SectionOrderButton = document.querySelector('.quantity-products');
    if (SectionOrderButton) {
        SectionOrderButton.addEventListener('click', goSectionOrders);
    }

    var addProductButton = document.getElementById('btn-add-product');
    if (addProductButton) {
        addProductButton.addEventListener('click', openSectionAddProduct);
        // addProductButton.addEventListener('click', openSectionIndepent("add_product.html", "Nuevo Producto"));
    }

    var addFieldTakePhotoProduct = document.getElementById('field-image-takephoto-product');
    if (addFieldTakePhotoProduct) {
        addFieldTakePhotoProduct.addEventListener('click', takePhoto);
    }

    var addFieldSelectPhotoProduct = document.getElementById('field-image-selectphoto-product');
    if (addFieldSelectPhotoProduct) {
        addFieldSelectPhotoProduct.addEventListener('click', selectPhoto);
    }

    var form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Evita la recarga de la página
            saveData(); // Llama a la función para guardar los datos
        });
    }
}


function showSlidingMessage(message) {
    var $message = $('#sliding-message');

    // Establecer el texto del mensaje
    $message.text(message);

    // Mostrar el elemento deslizándolo hacia arriba
    $message.removeClass('hidden').css('bottom', '20px');

    // Esperar 3 segundos y luego ocultar el mensaje
    setTimeout(function () {
        $message.css('bottom', '-50px'); // Deslizar hacia abajo para ocultarlo

        // Ocultar completamente después de la animación
        setTimeout(function () {
            $message.addClass('hidden');
        }, 500); // Esperar a que termine la animación
    }, 2000); // Mostrar el mensaje durante 3 segundos
}


function backSectionButton() {
    const linkByDataLoad = document.querySelector('a[data-load="products.html"]');
    if (linkByDataLoad) {
        linkByDataLoad.click();
    }
}


function backSectionHome() {
    const linkByDataLoad = document.querySelector('a[data-load="home.html"]');
    if (linkByDataLoad) {
        linkByDataLoad.click();
    }
}

function goSectionOrders() {
    const linkByDataLoad = document.querySelector('a[data-load="orders.html"]');
    if (linkByDataLoad) {
        linkByDataLoad.click();
    }
}




function getIp() {

    // Obtener la IP del dispositivo
    networkinterface.getWiFiIPAddress(function (ipInfo) {

        var ip = ipInfo.ip;

        console.log("La IP del dispositivo es: " + ip);
        navigator.notification.alert(
            'La IP del dispositivo es' + ip,
            null,
            'exito',
            'OK'
        );

        scanNetworkForPrinters(ip);
    }, function (error) {
        console.log('Error al obtener la IP: ' + error.message);
        navigator.notification.alert(
            'Error al obtener la IP: ' + error.message,
            null,
            'Error',
            'OK'
        );
    });

}



function scanNetworkForPrinters(deviceIP) {
    var baseIP = deviceIP.substring(0, deviceIP.lastIndexOf('.') + 1); // Obtener la base de la IP
    var rangeStart = 1;
    var rangeEnd = 254;
    var printerPorts = [631, 9100, 515]; // Puertos comunes de impresoras

    console.log("Escaneando la red en el rango: " + baseIP + "1 a " + baseIP + rangeEnd);

    for (var i = rangeStart; i <= rangeEnd; i++) {
        var ipToCheck = baseIP + i;

        // Verificar cada IP en la red local y en diferentes puertos de impresoras
        printerPorts.forEach(function (port) {
            // fetch(`http://${ipToCheck}:${port}`, { method: 'GET', mode: 'no-cors' })
            fetch(`http://${ipToCheck}`, { method: 'GET', mode: 'no-cors' })
                .then(response => {
                    if (response.ok) {
                        console.log("Impresora encontrada en la IP: " + ipToCheck + " en el puerto: " + port);
                        navigator.notification.alert(
                            "Impresora encontrada en la IP: " + ipToCheck + " en el puerto: " + port,
                            null,
                            'exito',
                            'OK'
                        );
                    }
                })
                .catch(error => {
                    console.log("No se pudo conectar a: " + ipToCheck + " en el puerto: " + port);
                });
        });
    }
}


function openSectionIndepent(data_url, data_breadcrumb) {
    // var url = $(this).data('load');
    var url = data_url
    $('#content').load(url, function () {
        $('.tab-content').addClass('show');
        $('#content').find('#' + url.split('.')[0]).addClass('show');
        assignEventListeners();

        var breadcrumbDiv = document.getElementById('breadcrumb');
        breadcrumbDiv.innerHTML = data_breadcrumb;

    });
    $('.tab').removeClass('active');
    $(this).addClass('active');
}


