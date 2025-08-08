let datosCSV = [];
let charts = {};

// Cargar CSV
document.getElementById('csvFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        datosCSV = CSVToArray(text);s
        mostrarTabla(datosCSV);
        actualizarGraficos(datosCSV.slice(1), datosCSV[0]);
    };

    reader.readAsText(file);
});

// Parseo CSV a Array
function CSVToArray(strData, strDelimiter = ",") {
    return strData.trim().split("\n").map(row => row.split(strDelimiter));
}

// Mostrar tabla en HTML
function mostrarTabla(data) {
    const tabla = document.getElementById("csvTable");
    tabla.innerHTML = "";
    data.forEach((row, i) => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const td = document.createElement(i === 0 ? "th" : "td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tabla.appendChild(tr);
    });
}

// Función de filtrado 
function filtrarDatos() {
    const anio = document.getElementById("anio").value;
    const tipo = document.getElementById("tipo").value.toLowerCase();
    const pais = document.getElementById("pais").value.toLowerCase();
    const genero = document.getElementById("genero").value.toLowerCase();

    const headers = datosCSV[0];

    const filtrados = datosCSV.filter((fila, i) => {
        if (i === 0) return true; // Encabezados

        const [año, tipoDato, generoDato, paisDato] = [fila[0], fila[1], fila[2], fila[3]];

        return (
            (!anio || año.includes(anio)) &&
            (!tipo || tipoDato.toLowerCase().includes(tipo)) &&
            (!pais || paisDato.toLowerCase().includes(pais)) &&
            (!genero || generoDato.toLowerCase().includes(genero))
        );
    });

    mostrarTabla(filtrados);
    actualizarGraficos(filtrados.slice(1), headers);
}

// Gráficos 
function actualizarGraficos(data, headers) {
    const indexTipo = headers.indexOf('Tipo');
    const indexGenero = headers.indexOf('Genero');
    const indexCantidad = headers.indexOf('Cantidad');
    const indexAnio = headers.indexOf('Año');
    const indexInnovacion = headers.indexOf('Innovación');

    const tipoCount = {};
    const femeninoCount = {};
    const lineData = {};
    const comparativa = { emprendimiento: {}, innovacion: {} };

    data.forEach(row => {
        const tipo = row[indexTipo];
        const genero = row[indexGenero];
        const cantidad = parseInt(row[indexCantidad]);
        const anio = row[indexAnio];
        const innovacion = parseFloat(row[indexInnovacion]);

        if (genero.toLowerCase() === 'femenino') {
            femeninoCount[tipo] = (femeninoCount[tipo] || 0) + cantidad;
        }

        tipoCount[tipo] = (tipoCount[tipo] || 0) + cantidad;

        lineData[anio] = (lineData[anio] || []);
        lineData[anio].push(innovacion);

        comparativa.emprendimiento[anio] = (comparativa.emprendimiento[anio] || 0) + cantidad;
        comparativa.innovacion[anio] = (comparativa.innovacion[anio] || 0) + innovacion;
    });

    const lineYears = Object.keys(lineData).sort();
    const lineAverages = lineYears.map(y => {
        const vals = lineData[y];
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    });

    const compYears = Object.keys(comparativa.emprendimiento).sort();
    const emprendimientoData = compYears.map(y => comparativa.emprendimiento[y]);
    const innovacionData = compYears.map(y => comparativa.innovacion[y]);

    for (const key in charts) {
        charts[key].destroy();
    }

    charts.barrasFemenino = new Chart(document.getElementById('barrasFemenino'), {
        type: 'bar',
        data: {
            labels: Object.keys(femeninoCount),
            datasets: [{
                label: 'Emprendimiento Femenino',
                data: Object.values(femeninoCount),
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }]
        }
    });

    charts.tortaTipos = new Chart(document.getElementById('tortaTipos'), {
        type: 'pie',
        data: {
            labels: Object.keys(tipoCount),
            datasets: [{
                data: Object.values(tipoCount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        }
    });

    charts.lineasInnovacion = new Chart(document.getElementById('lineasInnovacion'), {
        type: 'line',
        data: {
            labels: lineYears,
            datasets: [{
                label: 'Innovación Mundial',
                data: lineAverages,
                borderColor: '#36A2EB',
                fill: false
            }]
        }
    });

    charts.areaComparativa = new Chart(document.getElementById('areaComparativa'), {
        type: 'line',
        data: {
            labels: compYears,
            datasets: [
                {
                    label: 'Emprendimiento',
                    data: emprendimientoData,
                    backgroundColor: 'rgba(255,206,86,0.4)',
                    borderColor: 'rgba(255,206,86,1)',
                    fill: true
                },
                {
                    label: 'Innovación',
                    data: innovacionData,
                    backgroundColor: 'rgba(153,102,255,0.4)',
                    borderColor: 'rgba(153,102,255,1)',
                    fill: true
                }
            ]
        }
    });
}

//Funciona para Limpiar Filtros

function limpiarFiltros() {
    document.getElementById("anio").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("pais").value = "";
    document.getElementById("genero").value = "";

    // Mostrar todos los datos sin filtrar
    if (datosCSV.length > 1) {
        mostrarTabla(datosCSV);
        actualizarGraficos(datosCSV.slice(1), datosCSV[0]);
    }
}