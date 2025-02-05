/* global BTPrinter */
/*global $ */
/*global window */
/*global document */


formLogin();


document.getElementById('button-login').addEventListener('click', function() {
	const user = $('#login-user').val();
	const password = $('#login-password').val();
	login(user,password)
});

document.getElementById('logout').addEventListener('click', function() {
	setLogoutUser();
});

function setLogoutUser(){
	if (window.localStorage.getItem('user-login') !== undefined && window.localStorage.getItem('user-login')){
		var data_login = JSON.parse(localStorage.getItem('user-login'));
		var basicAuthCredential = data_login.name + ":" + data_login.pass;
		var bace64 =  btoa(basicAuthCredential);
		var basic = 'Basic ' + bace64;

	/*	$.ajax({
			url: 'https://dev-ordux.pantheonsite.io/user/logout?_format=json&token='+data_login.logout_token,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRF-Token':  data_login.csrf_token,
			},
			withCredentials: true,
			dataType: 'json',
			success : function(response){
				console.log(response);
			},
			error: function(error){
				console.log(error.responseJSON);
			}
		});*/

		$.ajax({
			url: 'https://dev-ordux.pantheonsite.io/api/user/logoutx/'+data_login.uid+'?_format=hal_json',
			type: 'GET',
			headers: {
				'Content-Type': 'application/hal+json',
				'X-CSRF-Token': data_login.csrf_token,
				'Authorization': basic
			},
			data: {},
			success : function(response){
				console.log(response);
				window.plugins.toast.showLongBottom(response.message);
				localStorage.clear();
				localStorage.removeItem('user-login');
				location.reload();

				var success = function(status) {
					console.log('Message: ' + status);
					window.plugins.toast.showLongBottom('Message: ' + status);
				};
				var error = function(status) {
					console.log('Error: ' + status);
					window.plugins.toast.showLongBottom('Error: ' + status);
				};
				window.cache.clear(success, error);
				window.cache.cleartemp();
			},
			error: function(error){
				console.log(error.responseJSON);
			}
		});


	}
}







function formLogin(){
	$("body").css("overflow","hidden");
	if (window.localStorage.getItem('user-login') !== undefined
		&& window.localStorage.getItem('user-login')
	){
		document.getElementById("overlay-login").style.height = "0%";
		$("body").css("overflow","auto");
	}
}


/*function backuplogin(user,password){
	fetch("https://dev-ordux.pantheonsite.io/session/token").then(function (response) {
		return response;
	})
		.then(function (token){

			fetch("https://dev-ordux.pantheonsite.io/user/login?_format=json",{
				method: "POST",
				headers: {
					"Access-Control-Allow-Headers" : "Content-Type",
					"Content-type": "application/json",
					"X-CSRF-Token": token,
				},
				body: JSON.stringify({
					name: user,
					pass: password,
				}),
			})
				.then((response) => response.json())
				.then((data) => {
				});
		}
		);
}*/


function login(user,password) {

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
					name: user,
					pass: password,
				}),
				success : function(response){
					console.log(response);
					document.getElementById("overlay-login").style.height = "0%";
					$("body").css("overflow","auto");
					localStorage.setItem('user-login',JSON.stringify(
						{
							uid: response.current_user.uid,
							name: user,
							pass: password,
							csrf_token: response.csrf_token,
							logout_token: response.logout_token
						}
					))
					$('#login-user').val("");
					$('#login-password').val("");
				},
				error: function(error){
					$('.forgot').text("Error de Autenticacion")
					/*console.log(error);
					window.plugins.toast.showLongBottom(error.responseJSON);*/
				}
			})
		},
		error: function(error){
			console.log(error);
		}
	})
}

function getDataMenu(){
	var data_login = JSON.parse(localStorage.getItem('user-login'));
	var basicAuthCredential = data_login.name + ":" + data_login.pass;
	var bace64 =  btoa(basicAuthCredential);
	var basic = 'Basic ' + bace64;

	$.ajax({
		url: 'https://dev-ordux.pantheonsite.io/api/get-menu/2?_format=hal_json',
		type: 'GET',
		headers: {
			'Content-Type': 'application/hal+json',
			'X-CSRF-Token': data_login.csrf_token,
			'Authorization': basic
		},
		data: {},
		success : function(response){
			console.log(response[0].menu);
			window.plugins.toast.showLongBottom(response[0].menu);
		},
		error: function(error){
			console.log(error.responseJSON);
		}
	})
}





var app = {
	initialize: function () {
		if (typeof (window.cordova) !== 'undefined') {
			document.addEventListener('deviceready', function () {
				onDeviceReady(true);
			}, false);
		} else {
			onDeviceReady(false);
		}
	}
};

function onDeviceReady() {


	// Cordova has been loaded. Perform any initialization that requires Cordova here.
	console.log('onDeviceReady()');

	// Handle the Cordova pause and resume events
	document.addEventListener('pause', onPause.bind(this), false);
	document.addEventListener('resume', onResume.bind(this), false);


}

function onPause() {
	// TODO: This application has been suspended. Save application state here.
}

function onResume() {
	// TODO: This application has been reactivated. Restore application state here.
}



/* Initialize app */
app.initialize();
