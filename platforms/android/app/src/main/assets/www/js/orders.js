
// let carrito = {};
function initializeOrders() {
	const items = document.getElementById('items');
	const footer = document.getElementById('footer');
	const fixedFooterContainer = document.getElementById('fixed-footer-container');
	const fragment = document.createDocumentFragment();
	const templateFooter = document.getElementById('template-footer').content;
	const templateCarrito = document.getElementById('template-carrito').content;


	const btnAumentarDisminuir = e => {
		if (e.target.classList.contains('cbtn-dark')) {
			const producto = carrito[e.target.dataset.id];
			if (producto.stock <= 0) {
				e.target.disabled = true;
				e.target.classList.add('disabled');
			} else {
				producto.cantidad++;
				producto.stock--;
				carrito[e.target.dataset.id] = { ...producto };
				pintarCarrito();
			}
		}

		if (e.target.classList.contains('cbtn-warning')) {
			const producto = carrito[e.target.dataset.id];
			producto.cantidad--;
			producto.stock++;
			if (producto.cantidad === 0) {
				delete carrito[e.target.dataset.id];
			} else {
				carrito[e.target.dataset.id] = { ...producto };
			}
			pintarCarrito();
		}
		e.stopPropagation();
	};

	const pintarCarrito = () => {
		items.innerHTML = '';

		Object.values(carrito).forEach(producto => {
			templateCarrito.querySelector('th').textContent = producto.id;
			templateCarrito.querySelectorAll('td')[0].textContent = producto.name;
			templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
			templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad;

			templateCarrito.querySelector('.cbtn-dark').dataset.id = producto.id;
			templateCarrito.querySelector('.cbtn-warning').dataset.id = producto.id;

			const clone = templateCarrito.cloneNode(true);
			fragment.appendChild(clone);
		});
		items.appendChild(fragment);

		pintarFooter();
		localStorage.setItem('carrito', JSON.stringify(carrito));
	};

	const pintarFooter = () => {
		fixedFooterContainer.innerHTML = '';

		if (Object.keys(carrito).length === 0) {
			fixedFooterContainer.innerHTML = `
				<th scope="row" colspan="5">Carrito de Pedidos vacío</th>
			`;
			return;
		}

		const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
		const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0);

		templateFooter.querySelector('.quantity-product').textContent = nCantidad;
		templateFooter.querySelector('.total-price').textContent = nPrecio;

		const clone = templateFooter.cloneNode(true);
		fragment.appendChild(clone);

		fixedFooterContainer.appendChild(fragment);

		const btnSendOrder = document.querySelector('#enviar-pedido');
		btnSendOrder.addEventListener('click', () => {
			const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
			confirmModal.show();
		});

		const confirmButton = document.getElementById('confirmButton');
		confirmButton.addEventListener('click', function () {
			const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
			confirmModal.hide();
			//setOrder(JSON.parse(localStorage.getItem('carrito')));
			actualizarStockProductosBD();
		});


		const boton = document.querySelector('#vaciar-carrito');
		boton.addEventListener('click', () => {
			const confirmDeleteOrderModal = new bootstrap.Modal(document.getElementById('confirmDeleteOrderModal'));
			confirmDeleteOrderModal.show();
		});

		const confirmDeleteOrderButton = document.getElementById('confirmDeleteOrderButton');
		confirmDeleteOrderButton.addEventListener('click', function () {
			const confirmDeleteOrderModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteOrderModal'));
			confirmDeleteOrderModal.hide();
			carrito = {};
			pintarCarrito();
		});
	};

	items.addEventListener('click', e => {
		btnAumentarDisminuir(e);
	});

	function setOrder(data) {
		login();
		setTimeout(function () {
			var data_login = JSON.parse(localStorage.getItem('user-login'));
			var basicAuthCredential = data_login.name + ":" + data_login.pass;
			var bace64 = btoa(basicAuthCredential);
			var basic = 'Basic ' + bace64;

			$.ajax({
				url: 'https://dev-ordux.pantheonsite.io/api/orders?_format=hal_json',
				type: 'POST',
				headers: {
					'Content-Type': 'application/hal+json',
					'X-CSRF-Token': data_login.csrf_token,
					'Authorization': basic
				},
				data: JSON.stringify(data),
				beforeSend: function () {
					$('#loader').removeClass('hidden');
				},
				success: function (response) {
					console.log(response.result);
					$('#message_order').text(response.result);
					carrito = {};
					pintarCarrito();
					navigator.notification.alert(
						response.result,
						null,
						'Éxito',
						'OK'
					);
					localStorage.setItem('orden', response.order);
				},
				error: function (error) {
					console.log(error.statusText);
					navigator.notification.alert(
						error,
						null,
						'error',
						'OK'
					);
				},
				complete: function () {
					$('#loader').addClass('hidden');
					navigator.notification.alert(
						"se completo",
						null,
						'exito',
						'OK'
					);
				},
			});
		}, 100);
	}

	function login() {
		$.ajax({
			url: 'https://dev-ordux.pantheonsite.io/session/token',
			type: 'GET',
			success: function (token) {
				$.ajax({
					url: 'https://dev-ordux.pantheonsite.io/user/login?_format=json',
					method: "POST",
					headers: {
						"Access-Control-Allow-Headers": "Content-Type",
						"Content-type": "application/json",
						"X-CSRF-Token": token,
					},
					data: JSON.stringify({
						name: 'ordux',
						pass: 'admin',
					}),
					success: function (response) {
						console.log(response);
						localStorage.setItem('user-login', JSON.stringify(
							{
								uid: response.current_user.uid,
								name: 'ordux',
								pass: 'admin',
								csrf_token: response.csrf_token,
								logout_token: response.logout_token
							}
						));
					},
					error: function (error) {
						console.log(error);
					}
				});
			},
			error: function (error) {
				console.log(error);
			}
		});
	}

	if (localStorage.getItem('carrito')) {
		carrito = JSON.parse(localStorage.getItem('carrito'));
		pintarCarrito();
	}



	function actualizarStockProductosBD() {


		var db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

		if (localStorage.getItem('carrito')) {
			carrito = JSON.parse(localStorage.getItem('carrito'));

			Object.values(carrito).forEach(producto => {

				var productId = producto.id;
				var stock = producto.stock;

				db.transaction(function (tx) {
					tx.executeSql('UPDATE productos  SET stock = ? WHERE id = ?', [stock, productId]);
				}, function (error) {
					console.log('Transaction ERROR: ' + error.message);
				}, function () {
					saveOrder(producto);
					carrito = {};
					pintarCarrito();
					console.log('Data updated successfully!');
				});

			});

			openSectionIndepent("order-confirm.html", "orden");

			setTimeout(() => {

				generateTable();

			}, 2000);

		}
	}
	function saveOrder(producto) {
		const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
		// Crea la tabla si no existe
		db.transaction(tx => {
			tx.executeSql(`
				CREATE TABLE IF NOT EXISTS orders (
					id INTEGER PRIMARY KEY,
					id_producto INTEGER NOT NULL,
					name TEXT NOT NULL,
					price INTEGER NOT NULL,
					category TEXT NOT NULL,
					quantity INTEGER NOT NULL,
					date TEXT NOT NULL,
					FOREIGN KEY (id_producto) REFERENCES productos (id)
				);
			`);
		});


		db.transaction(tx => {
			tx.executeSql(
				`INSERT INTO orders (id_producto, name, price, category, quantity, date) VALUES (?, ?, ?, ?, ?, datetime('now', '-5 hours'))`,
				[producto.id, producto.name, producto.precio, producto.category, producto.cantidad],
				(tx, result) => {
					console.log('Orden guardada correctamente', result);
				},
				(tx, error) => {
					console.error('Error al guardar la orden:', error);
				}
			);
		});


	}






}
