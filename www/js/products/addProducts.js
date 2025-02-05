function openSectionAddProduct() {
    var url = $(this).data('load');
    $('#content').load(url, function () {
        $('.tab-content').addClass('show');
        $('#content').find('#' + url.split('.')[0]).addClass('show');
        assignEventListeners();

        var breadcrumbDiv = document.getElementById('breadcrumb');
        breadcrumbDiv.innerHTML = "Nuevo Producto";

    });
    $('.tab').removeClass('active');
    $(this).addClass('active');
}

function createDatabase() {
    // var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

    // db.transaction(function (tx) {
    //     tx.executeSql('CREATE TABLE IF NOT EXISTS myTable (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
    // }, function (error) {
    //     console.log('Transaction ERROR: ' + error.message);
    //     navigator.notification.alert(
    //         'Transaction ERROR: ' + error.message,
    //         null,
    //         'Error',
    //         'OK'
    //     );
    // }, function () {
    //     console.log('Database and table created successfully!');
    //     navigator.notification.alert(
    //         'Database and table created successfully! ',
    //         null,
    //         'exito',
    //         'OK'
    //     );

    // });

    //insertData();
    searchData();
    selectPhoto()
}


function insertData() {
    var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
    db.transaction(function (tx) {
        tx.executeSql('INSERT INTO myTable (name, age) VALUES (?, ?)', ['John Doe', 30]);
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
        navigator.notification.alert(
            'Transaction ERROR: ' + error.message,
            null,
            'Error',
            'OK'
        );
    }, function () {
        console.log('Data inserted successfully!');
        navigator.notification.alert(
            'Data inserted successfully! ',
            null,
            'exito',
            'OK'
        );
    });


    // db.transaction(tx => {
    //     productos.forEach(producto => {
    //         tx.executeSql(`
    //             INSERT OR REPLACE INTO productos (id, precio, title, category, thumbnailUrl) 
    //             VALUES (?, ?, ?, ?, ?);
    //         `, [producto.id, producto.precio, producto.title, producto.category, producto.thumbnailUrl]);
    //     });
    // });
}

function searchData() {
    var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM productos', [], function (tx, resultSet) {
            for (var i = 0; i < resultSet.rows.length; i++) {
                console.log("id: " + resultSet.rows.item(i).id + ", precio: " + resultSet.rows.item(i).precio + ", title: " + resultSet.rows.item(i).title + ", category: " + resultSet.rows.item(i).category);
                navigator.notification.alert(
                    "id: " + resultSet.rows.item(i).id + ", precio: " + resultSet.rows.item(i).precio + ", title: " + resultSet.rows.item(i).title + ", category: " + resultSet.rows.item(i).category,
                    null,
                    'exito',
                    'OK'
                );
            }
        }, function (error) {
            console.log('SELECT SQL statement ERROR: ' + error.message);
        });
    });
}


function updateData() {
    db.transaction(function (tx) {
        tx.executeSql('UPDATE myTable SET age = ? WHERE name = ?', [35, 'John Doe']);
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Data updated successfully!');
    });
}

function deleteData() {
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM myTable WHERE name = ?', ['John Doe']);
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Data deleted successfully!');
    });
}


function saveData() {
    const linkByDataLoad = document.querySelector('a[data-load="products.html"]');

    var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
    var name = document.getElementById('field-name-product').value;
    var sale_price = parseFloat(document.getElementById('field-sale-price-product').value);
    var purchase_price = parseFloat(document.getElementById('field-purchase-price-product').value);
    var stock = document.getElementById('field-stock-product').value;
    var category = document.getElementById('field-category-product').value;

    // Capturar los valores opcionales
    var sku = document.getElementById('field-sku-product').value || null;
    var bar_code = document.getElementById('field-bar-code-product').value || null;
    var type = document.getElementById('field-type-product').value || null;

    // Capturar la imagen si existe
    var imgElement = document.getElementById('capturedImage');
    var imageBase64 = imgElement ? imgElement.src : null;

    // Crear la consulta SQL dinámicamente
    var fields = ['image', 'name', 'sale_price', 'purchase_price', 'stock', 'category'];
    var values = [imageBase64, name, sale_price, purchase_price, stock, category];

    // Solo agregar campos opcionales si tienen valores
    if (sku !== null) {
        fields.push('sku');
        values.push(sku);
    }
    if (bar_code !== null) {
        fields.push('bar_code');
        values.push(bar_code);
    }

    if (type !== null) {
        fields.push('type');
        values.push(type);
    }

    // Crear la cadena SQL final
    var sql = `INSERT INTO productos (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    db.transaction(function (tx) {
        tx.executeSql(sql, values,
            function (tx, res) {
                console.log("Producto guardado con éxito en la base de datos con id: " + res.insertId);

                if (linkByDataLoad) {
                    $('#loader').removeClass('hidden');
                    showSlidingMessage('Producto guardado con éxito');
                    setTimeout(function () {
                        linkByDataLoad.click();
                    }, 3000);
                }
            }, function (tx, error) {
                console.log("Error al guardar el producto: " + error.message);
            });
    });
}








