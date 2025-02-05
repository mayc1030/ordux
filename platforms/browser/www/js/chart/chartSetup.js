function loadChartData() {


    document.getElementById('datePicker').addEventListener('change', function (event) {

        const fechaInput = document.getElementById('datePicker');
        const filtrarButton = document.getElementById('filtrar');

        filtrarButton.addEventListener('click', () => {
            const fechaSeleccionada = fechaInput.value; // Obtiene el valor del campo
            if (fechaSeleccionada) {
                console.log(`Fecha seleccionada: ${fechaSeleccionada}`);
                selectedDate = fechaSeleccionada
                lloadChartData(selectedDate);
            } else {
                console.error('No se seleccionó ninguna fecha.');
            }
        });

    });

    lloadChartData(new Date().toISOString().split('T')[0]);

    document.getElementById('exportPDF').addEventListener('click', () => {
        // // Capturar el cuerpo completo del documento, incluyendo lo que está fuera de la vista (scroll)
        // html2canvas(document.body, {
        //     scrollY: -window.scrollY, // Ajustar el scroll para capturar correctamente desde la parte superior
        //     useCORS: true, // Habilitar CORS para cargar imágenes externas
        //     width: document.body.scrollWidth, // Capturar el ancho completo del contenido
        //     height: document.body.scrollHeight, // Capturar toda la altura del contenido (incluso el contenido con scroll)
        //     x: 0, // Comienza desde el lado izquierdo
        //     y: 0, // Comienza desde la parte superior
        //     scale: window.devicePixelRatio // Asegurarse de que la calidad sea alta
        // }).then(canvas => {
        //     const imgData = canvas.toDataURL('image/png'); // Convertir a imagen PNG

        //     // Acceder a jsPDF desde window.jspdf
        //     const { jsPDF } = window.jspdf;

        //     // Crear un documento PDF usando jsPDF
        //     const pdf = new jsPDF('landscape', 'mm', 'a4');

        //     // Configurar las dimensiones para que la imagen quepa en la página PDF
        //     const pdfWidth = pdf.internal.pageSize.getWidth();
        //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        //     // Insertar la imagen en el PDF
        //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        //     // Guardar el archivo PDF
        //     pdf.save('pantalla_completa_con_scroll.pdf');
        // }).catch(error => {
        //     console.error('Error al exportar la pantalla:', error);
        // });
        generatePDF();



        function generatePDF() {
            const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

            db.transaction(tx => {
                tx.executeSql('SELECT * FROM orders', [], (tx, result) => {
                    const orders = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        orders.push(result.rows.item(i));  // Obtiene cada fila como un objeto
                    }
                    console.log('entro ala consutla');
                    createPDF(orders); // Llama a la función para crear el PDF
                }, (tx, error) => {
                    console.error('Error al obtener los datos:', error);
                });
            });
        }


        function createPDF(orders) {
            console.log('entro a crerpdf');
            const { jsPDF } = window.jspdf; // Asegúrate de que jsPDF esté cargado en tu proyecto
            const doc = new jsPDF();

            // Títulos de las columnas
            const headers = ['ID Producto', 'Nombre', 'Precio', 'Categoría', 'Cantidad', 'Fecha'];

            // Añadir un título al PDF
            doc.setFontSize(16);
            doc.text('Listado de Ordenes', 20, 20);

            // Establecer el formato de la tabla
            doc.autoTable({
                head: [headers],
                body: orders.map(order => [
                    order.id_producto,
                    order.name,
                    order.price,
                    order.category,
                    order.quantity,
                    order.date,
                ]),
                startY: 30, // Empieza a dibujar la tabla a partir de la coordenada Y 30
            });

            // Guarda el archivo PDF en el dispositivo móvil
            savePDFToDevice(doc);
        }

        function savePDFToDevice(doc) {
            console.log('entro a genrarpdf');
            window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directoryEntry) {
                // Nombre del archivo
                const fileName = 'ordenes.pdf';

                // Crear o abrir el archivo en la ubicación especificada
                directoryEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        // Convertir el PDF a Blob y escribirlo en el archivo
                        const pdfBlob = doc.output('blob');
                        fileWriter.write(pdfBlob);
                        navigator.notification.alert(
                            'archivo creado.' + fileEntry.nativeURL,
                            null,
                            'Éxito',
                            'OK'
                        );

                        fileWriter.onwriteend = function () {
                            console.log('PDF guardado correctamente en:', fileEntry.fullPath);
                            alert('PDF guardado en: ' + fileEntry.fullPath);
                        };

                        fileWriter.onerror = function (error) {
                            console.error('Error al guardar el PDF:', error);
                        };
                    });
                });
            }, function (error) {
                console.error('Error al acceder al sistema de archivos:', error);
            });




        }

    });




}

function lloadChartData(selectedDate = null) {

    const db = window.sqlitePlugin.openDatabase({ name: 'ordux.db', location: 'default' });

    // Si no se ha pasado una fecha, usamos la fecha actual
    const dateToFilter = selectedDate || new Date().toISOString().split('T')[0];
    console.log(`Feste es el dato: ${selectedDate}`);

    db.transaction(tx => {
        tx.executeSql(
            // Filtrar órdenes de la fecha seleccionada y calcular la suma de precios totales
            `SELECT name, SUM(quantity) as totalQuantity, SUM(price * quantity) as totalPrice 
             FROM orders 
             WHERE date(date) = ? 
             GROUP BY name;`,
            [dateToFilter], // Usar la fecha seleccionada
            (tx, result) => {
                const labels = [];
                const data = [];
                const colors = [];
                let totalSum = 0;
                let totalQuantity = 0;
                let maxQuantity = 0;
                let bestSeller = '';

                // Iterar sobre los resultados de la consulta
                for (let i = 0; i < result.rows.length; i++) {
                    const row = result.rows.item(i);
                    labels.push(row.name);
                    data.push(row.totalQuantity);
                    colors.push(generateRandomColor());
                    totalSum += row.totalPrice;
                    totalQuantity += row.totalQuantity;

                    if (row.totalQuantity > maxQuantity) {
                        maxQuantity = row.totalQuantity;
                        bestSeller = row.name;
                    }
                }

                // Inicializar el gráfico con los datos obtenidos
                initializeChart(labels, data, colors);

                // Mostrar la suma total, cantidad total y el producto más vendido
                displayTotalSum(totalSum, totalQuantity, bestSeller, dateToFilter);
            },
            (tx, error) => {
                console.error('Error al cargar datos para el gráfico:', error);
            }
        );
    });
}



// Función para generar un color aleatorio
function generateRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`; // Color con transparencia
}

let myChart; // Variable global para mantener la instancia del gráfico

function initializeChart(labels, data, colors) {
    const canvas = document.getElementById('myChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Si ya existe un gráfico, destruirlo antes de crear uno nuevo
            if (myChart) {
                myChart.destroy();
            }

            // Crear un nuevo gráfico
            myChart = new Chart(ctx, {
                type: 'pie', // Gráfico de pastel
                data: {
                    labels: labels, // Etiquetas dinámicas (nombres de productos)
                    datasets: [{
                        label: 'Cantidad vendida hoy por producto',
                        data: data, // Datos dinámicos (cantidad vendida)
                        backgroundColor: colors, // Colores dinámicos para cada sección
                        borderColor: colors.map(color => color.replace('0.5', '1')), // Bordes sólidos
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top', // Posición de la leyenda
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value} unidades`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            console.error('Cannot get 2d context from canvas');
        }
    } else {
        console.error('Canvas element not found');
    }
}


function displayTotalSum(totalSum, totalQuantity, bestSeller, selectedDate) {
    const totalElement = document.getElementById('totalSum');
    const totalQuantityElement = document.getElementById('totalQuantity');
    const bestSellerElement = document.getElementById('bestSeller');
    const dateElement = document.getElementById('currentDate');

    if (totalElement && totalQuantityElement && bestSellerElement && dateElement) {
        totalElement.textContent = `Total de ingresos de ${selectedDate}: $${totalSum}`;
        totalQuantityElement.textContent = `Cantidad total de productos vendidos: ${totalQuantity}`;
        bestSellerElement.textContent = `Producto más vendido: ${bestSeller}`;

        // Mostrar la fecha seleccionada
        dateElement.textContent = `Fecha seleccionada: ${selectedDate}`;
    } else {
        console.error('Uno o más elementos para mostrar los totales no fueron encontrados.');
    }
}



// Llamar a la función para cargar y mostrar los datos en el gráfico
// loadChartData();
