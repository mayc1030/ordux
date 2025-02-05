function initializeListProducts() {



	
	fetch('api.json')
		.then(response => response.json())
		.then(data => {
			pintarCards(data)
		})
		.catch(error => {
			console.error('Error al cargar el archivo JSON:', error);
		});



	const cards = document.getElementById('cards');
	const items = document.getElementById('items');
	const footer = document.getElementById('footer');
	const templateCard = document.getElementById('template-card').content;
	const templateFooter = document.getElementById('template-footer').content;
	const templateCarrito = document.getElementById('template-carrito').content;
	const fragment = document.createDocumentFragment();
	let carrito = {}

	// Agregar al carrito
	const addCarrito = e => {
		if (e.target.classList.contains('btn-dark')) {
			setCarrito(e.target.parentElement);
			//console.log(e.target.parentElement)
		}
		e.stopPropagation()
	}

	const setCarrito = objeto => {
		// console.log(item)
		const producto = {
			title: objeto.querySelector('h5').textContent,
			precio: objeto.querySelector('span').textContent,
			category: objeto.querySelector('.btn-dark').dataset.category,
			id: objeto.querySelector('.btn-dark').dataset.id,
			cantidad: 1
		}
		// console.log(producto)
		if (carrito.hasOwnProperty(producto.id)) {
			producto.cantidad = carrito[producto.id].cantidad + 1
		}

		carrito[producto.id] = { ...producto }
		//window.plugins.toast.showLongBottom('Producto Agregado al Pedido');
		pintarCarrito()
	}


	const btnAumentarDisminuir = e => {
		// console.log(e.target.classList.contains('btn-info'))
		if (e.target.classList.contains('btn-dark')) {
			const producto = carrito[e.target.dataset.id]
			producto.cantidad++
			carrito[e.target.dataset.id] = { ...producto }
			pintarCarrito()
		}

		if (e.target.classList.contains('btn-warning')) {
			const producto = carrito[e.target.dataset.id]
			producto.cantidad--
			if (producto.cantidad === 0) {
				delete carrito[e.target.dataset.id]
			} else {
				carrito[e.target.dataset.id] = { ...producto }
			}
			pintarCarrito()
		}
		e.stopPropagation()
	}


	const pintarCarrito = () => {
		items.innerHTML = ''

		Object.values(carrito).forEach(producto => {
			templateCarrito.querySelector('th').textContent = producto.id
			templateCarrito.querySelectorAll('td')[0].textContent = producto.title
			templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
			templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad

			//botones
			templateCarrito.querySelector('.btn-dark').dataset.id = producto.id
			templateCarrito.querySelector('.btn-warning').dataset.id = producto.id

			const clone = templateCarrito.cloneNode(true)
			fragment.appendChild(clone)
		})
		items.appendChild(fragment)

		pintarFooter()

		localStorage.setItem('carrito', JSON.stringify(carrito))
	}


	const pintarFooter = () => {
		footer.innerHTML = ''

		if (Object.keys(carrito).length === 0) {
			footer.innerHTML = `
        <th scope="row" colspan="5">Carrito de Pedidos vacío</th>
        `
			return
		}

		// sumar cantidad y sumar totales
		const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
		const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)
		// console.log(nPrecio)

		templateFooter.querySelectorAll('td')[0].textContent = nCantidad
		templateFooter.querySelector('span').textContent = nPrecio

		const clone = templateFooter.cloneNode(true)
		fragment.appendChild(clone)

		footer.appendChild(fragment)

		const btnSendOrder = document.querySelector('#enviar-pedido')
		btnSendOrder.addEventListener('click', () => {
			//console.log(JSON.parse(localStorage.getItem('carrito')))
			//carrito = {}
			//pintarCarrito()
			//getDataMenu()
			setOrder(JSON.parse(localStorage.getItem('carrito')))
		})

		const boton = document.querySelector('#vaciar-carrito')
		boton.addEventListener('click', () => {
			carrito = {}
			pintarCarrito()
		})

	}

	


	cards.addEventListener('click', e => {
		addCarrito(e);
	})

	items.addEventListener('click', e => {
		//window.plugins.toast.showLongBottom('Acción Realizada');
		btnAumentarDisminuir(e);
	})

	document.getElementById('category').addEventListener('change', function () {
		$(".product").remove();
		fetchData();
	});

	// Traer productos
	function fetchData() {
		$.getJSON('api.json', function (data) {
			pintarCards(data);
		}).fail(function () {
			console.log('An error has occurred.');
		});
	}

	// Pintar productos
	function pintarCards(data) {
		data.forEach(producto => {
			if (producto.category === document.getElementById("category").value) {
				templateCard.querySelector('h5').textContent = producto.title
				templateCard.querySelector('span').textContent = producto.precio
				templateCard.querySelector('img').setAttribute("src",producto.thumbnailUrl)
				templateCard.querySelector('.btn-dark').dataset.id = producto.id
				templateCard.querySelector('.btn-dark').dataset.category = producto.category
				const clone = templateCard.cloneNode(true)
				fragment.appendChild(clone)
			}
		})
		cards.appendChild(fragment)
	}



	function sendOrder() {


	}


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
				$('#loader').removeClass('hidden')
			},
			success: function (response) {
				//window.plugins.toast.showLongBottom(response.result);
				console.log(response.result)
				// $('#txtBase64').text(response.order);
				$('#message_order').text(response.result);
				carrito = {}
				pintarCarrito()
				// $('#printBase64').click()
				navigator.notification.alert(
                    response.result,
                    null,
                    'Éxito',
                    'OK'
                );
				localStorage.setItem('orden', response.order)
				
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
				$('#loader').addClass('hidden')
				navigator.notification.alert(
                    "se completo",
                    null,
                    'exito',
                    'OK'
                );
			},
		})
	}, 100);
	}


	function login() {

		$.ajax({
			url: 'https://dev-ordux.pantheonsite.io/session/token',
			type: 'GET',
			success : function(token){
				$.ajax({
					url: 'https://dev-ordux.pantheonsite.io/user/login?_format=json',
					method: "POST",
					headers: {
						"Access-Control-Allow-Headers" : "Content-Type",
						"Content-type": "application/json",
						"X-CSRF-Token": token,
					},
					data: JSON.stringify({
						name: 'ordux',
						pass: 'admin',
					}),
					success : function(response){
						console.log(response);
						localStorage.setItem('user-login',JSON.stringify(
							{
								uid: response.current_user.uid,
								name: 'ordux',
								pass: 'admin',
								csrf_token: response.csrf_token,
								logout_token: response.logout_token
							}
						))
					},
					error: function(error){
						console.log(error);
					}
				})
			},
			error: function(error){
				console.log(error);
			}
		})
	}


	if (localStorage.getItem('carrito')) {
		carrito = JSON.parse(localStorage.getItem('carrito'));
		pintarCarrito()
	}


}