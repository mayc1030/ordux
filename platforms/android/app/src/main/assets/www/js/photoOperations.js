function takePhoto() {
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 10,
        destinationType: Camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        targetWidth: 150, // Redimensionar la imagen
        targetHeight: 200, // Redimensionar la imagen
    });
}

function selectPhoto() {
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 10,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.DATA_URL,
        targetWidth: 150, // Redimensionar la imagen
        targetHeight: 200, // Redimensionar la imagen
    });
}

function onPhotoDataSuccess(imageData) {
    try {
        if (imageData) {
            var imageBase64 = "data:image/jpeg;base64," + imageData;
            var imgElement = document.getElementById('capturedImage');
            if (imgElement) {
                imgElement.src = imageBase64;
            } else {
                imgElement = document.createElement('img');
                imgElement.id = 'capturedImage';
                imgElement.src = imageBase64;
                document.getElementById('capturedImageContainer').appendChild(imgElement);
            }
        } else {
            throw new Error("Datos de la imagen no válidos");
        }
    } catch (error) {
        console.error("Error al mostrar la imagen en base64: ", error);
        navigator.notification.alert(
            'Error al mostrar la imagen en base64: ' + error.message,
            null,
            'Error',
            'OK'
        );
    }
}

function onFail(message) {
    navigator.notification.alert(
        'Error: ' + message,
        null,
        'Error',
        'OK'
    );
}
