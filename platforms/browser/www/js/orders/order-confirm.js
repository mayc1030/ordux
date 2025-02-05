function generateTable() {

    var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

    db.transaction(tx => {
        tx.executeSql('SELECT * FROM orders', [], (tx, result) => {
            const tableBody = document.querySelector('#ordersTable tbody');
            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows.item(i);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.name}</td>
                    <td>${row.price}</td>
                    <td>${row.category}</td>
                    <td>${row.date}</td>
                `;
                tableBody.appendChild(tr);
            }
        }, (tx, error) => {
            console.error('Error al obtener los datos:', error.message);
        });
    });

}

