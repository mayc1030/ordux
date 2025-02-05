let carrito = {}

function initializeListProducts() {


	function fetchData() {

		const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
		const searchText = document.getElementById('searchInput').value.toLowerCase();
		const selectedCategory = document.getElementById("category").value;


		let query = 'SELECT * FROM productos';
		let params = [];
		let conditions = [];

		if (selectedCategory !== "All") {
			conditions.push('category = ?');
			params.push(selectedCategory);
		}

		if (searchText) {
			conditions.push('LOWER(name) LIKE ?');
			params.push(`%${searchText}%`);
		}

		if (conditions.length > 0) {
			query += ' WHERE ' + conditions.join(' AND ');
		}

		query += ' ORDER BY name ASC';

		db.transaction(tx => {
			tx.executeSql(query, params, (tx, resultSet) => {
				const data = [];
				for (let i = 0; i < resultSet.rows.length; i++) {
					data.push(resultSet.rows.item(i));
				}
				pintarCards(data);
				console.log(data);
			}, (tx, error) => {
				console.log('Error al ejecutar la consulta:', error.message);
			});
		});

		actualizarStockProductos()
	}


	getCantidadProductos();


	const cards = document.getElementById('cards');
	const templateCard = document.getElementById('template-card').content;
	const fragment = document.createDocumentFragment();



	// Agregar al carrito
	const addCarrito = e => {
		if (e.target.classList.contains('btn-dark')) {
			setCarrito(e.target.parentElement);
			getCantidadProductos();
			actualizarStockProductos();
			//console.log(e.target.parentElement)
		}
		e.stopPropagation()
	}

	const setCarrito = objeto => {

		// console.log(item)
		const producto = {
			name: objeto.querySelector('h5').textContent,
			precio: objeto.querySelector('span').textContent,
			category: objeto.querySelector('.btn-dark').dataset.category,
			id: objeto.querySelector('.btn-dark').dataset.id,
			cantidad: 1,
			stock: objeto.querySelector('.value-stock').textContent - 1
		}

		// console.log(producto)
		if (carrito.hasOwnProperty(producto.id)) {
			producto.cantidad = carrito[producto.id].cantidad + 1
		}

		carrito[producto.id] = { ...producto }
		//window.plugins.toast.showLongBottom('Producto Agregado al Pedido');
		pintarCarrito()
	}


	const pintarCarrito = () => {
		localStorage.setItem('carrito', JSON.stringify(carrito))
	}



	cards.addEventListener('click', e => {
		addCarrito(e);
	})


	document.getElementById('category').addEventListener('change', function () {
		$(".product").remove();
		fetchData();
	});


	// obtener cantidad de productos pedidos
	function getCantidadProductos() {
		if (localStorage.getItem('carrito')) {
			carrito = JSON.parse(localStorage.getItem('carrito'));
			let total = 0;
			Object.values(carrito).forEach(producto => {
				total += producto.cantidad;
			});
			document.querySelector('.quantity-products').textContent = total;
		}
	}


	// Traer productos
	function fetchDatax() {
		$.getJSON('api.json', function (data) {
			pintarCards(data);
		}).fail(function () {
			console.log('An error has occurred.');
		});
	}

	// Pintar productos
	function pintarCards(data) {

		const selectedCategory = document.getElementById("category").value;

		data.forEach(producto => {
			// Muestra todos los productos si "All" está seleccionado
			if (selectedCategory === "All" || producto.category === selectedCategory) {
				templateCard.querySelector('.btn-dark').dataset.id = producto.id;
				templateCard.querySelector('img').setAttribute("src", producto.image);
				templateCard.querySelector('h5').textContent = producto.name;
				templateCard.querySelector('span').textContent = producto.sale_price
				templateCard.querySelector('.value-stock').textContent = producto.stock
				templateCard.querySelector('.btn-dark').dataset.category = producto.category;

				const btn = templateCard.querySelector('.btn-dark');

				if (producto.stock <= 0) {
					btn.setAttribute('disabled', 'true');
					btn.textContent = "Agotado";
				} else {
					btn.removeAttribute('disabled');
					btn.textContent = "Pedir";
				}

				const clone = templateCard.cloneNode(true);
				fragment.appendChild(clone);
			}
		});
		cards.appendChild(fragment)
	}

	fetchData();




	function actualizarStockProductos() {
		let carrito = JSON.parse(localStorage.getItem('carrito'));

		setTimeout(function () {
			const botones = document.querySelectorAll('.btn-dark');

			botones.forEach(button => {
				const productId = button.getAttribute('data-id');
				// console.log('Producto ID:', productId);

				if (carrito[productId]) {
					const cantidadStock = carrito[productId].stock;
					const stockElement = button.closest('.card-body').querySelector('.value-stock');


					if (stockElement) {
						stockElement.textContent = cantidadStock;
					}

					if (cantidadStock <= 0) {
						button.disabled = true;
						button.textContent = "Agotado";
					} else {
						button.disabled = false;
						button.textContent = "Pedir";
					}
				}
			});

		}, 100);
	}



}

function handleKeyPress(event) {
	if (event.key === 'Enter') {
		event.preventDefault();

		const selectElement = document.getElementById('category');
		const changeEvent = new Event('change', { bubbles: true });
		selectElement.dispatchEvent(changeEvent);

		//  searchProducts();
	}
}

// function searchProducts() {

// 	const templateCard = document.getElementById('template-card').content;
// 	const fragment = document.createDocumentFragment();
// 	const cards = document.getElementById('cards');

// 	cards.innerHTML = '';

// 	const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });
//     const searchText = document.getElementById('searchInput').value.toLowerCase();
//     db.transaction(tx => {
//         tx.executeSql(
//             `SELECT * FROM productos WHERE LOWER(title) LIKE ?`,
//             [`%${searchText}%`],
//             (tx, results) => {
//                 const len = results.rows.length;
//                 let products = [];
//                 for (let i = 0; i < len; i++) {
//                     products.push(results.rows.item(i));
//                 }

// 				products.forEach(producto => {
// 						templateCard.querySelector('h5').textContent = producto.title
// 						templateCard.querySelector('span').textContent = producto.price
// 						templateCard.querySelector('img').setAttribute("src", producto.image)
// 						templateCard.querySelector('.btn-dark').dataset.id = producto.id
// 						templateCard.querySelector('.btn-dark').dataset.category = producto.category
// 						const clone = templateCard.cloneNode(true)
// 						fragment.appendChild(clone)
// 				})
// 				cards.appendChild(fragment)

// 				//console.log('entroi '+JSON.stringify(products, null, 2));
//             },
//             (tx, error) => {
//                 console.log('Error al buscar productos: ' + error.message);
//             }
//         );
//     });
// }


