
const nav = document.querySelector('#nav');
const menu = document.querySelector('#menu');
const menuToggle = document.querySelector('.nav__toggle');
let isMenuOpen = false;

// TOGGLE MENU ACTIVE STATE
menuToggle.addEventListener('click', e => {
	e.preventDefault();
	isMenuOpen = !isMenuOpen;
	// toggle a11y attributes and active class
	menuToggle.setAttribute('aria-expanded', String(isMenuOpen));

	nav.classList.toggle('nav--open');
	const controlElement = document.querySelector('.control');
	if (isMenuOpen) {
		document.getElementById("myNav").style.width = "100%";
		$("body").css("overflow", "hidden");

		if (controlElement) {
			controlElement.classList.add('slide-out');
			//controlElement.classList.add('fade-out');
			//controlElement.remove();
		}
	}
	else {
		document.getElementById("myNav").style.width = "0%";
		$("body").css("overflow", "auto");
		if (controlElement) {
			controlElement.style.display = 'block'; // O 'flex', según tu diseño
			controlElement.classList.remove('slide-out'); // Quita la clase de deslizamiento para restaurarlo
			controlElement.style.transform = 'translateX(0)'; // Asegura que esté en su posición inicial
		}
	}

});