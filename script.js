// Base de datos simulada
let turnosDB = JSON.parse(localStorage.getItem('turnosDB')) || [];

// Funciones para pestañas
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Generar número de turno aleatorio
function generarNumeroTurno() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    
    // 3 letras
    for (let i = 0; i < 3; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 4 números
    for (let i = 0; i < 4; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
}

// Formatear fecha
function formatearFecha(fecha) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

// Formulario de turno
document.getElementById('turnoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const numeroTurno = generarNumeroTurno();
    const fecha = document.getElementById('fecha').value;
    const horario = document.getElementById('horario').value;
    
    // Crear objeto de turno
    const nuevoTurno = {
        id: numeroTurno,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        vehiculo: document.getElementById('vehiculo').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        problema: document.getElementById('problema').value,
        fecha: fecha,
        horario: horario,
        fechaIngreso: new Date().toLocaleDateString('es-ES'),
        estado: 'pendiente',
        actualizaciones: [
            {
                fecha: new Date().toLocaleString('es-ES'),
                mensaje: 'Turno asignado. Pendiente de revisión.'
            }
        ]
    };
    
    // Guardar en la "base de datos"
    turnosDB.push(nuevoTurno);
    localStorage.setItem('turnosDB', JSON.stringify(turnosDB));
    
    // Mostrar resultados
    document.getElementById('numeroTurno').textContent = numeroTurno;
    document.getElementById('clienteNombre').textContent = `${nuevoTurno.nombre} ${nuevoTurno.apellido}`;
    document.getElementById('fechaTurno').textContent = formatearFecha(fecha);
    document.getElementById('horarioTurno').textContent = horario;
    
    document.getElementById('turnoForm').reset();
    document.getElementById('turnoForm').classList.add('hidden');
    document.getElementById('turnoResult').classList.remove('hidden');
});

// Imprimir turno
function printTurno() {
    const contenido = `
        <h1>Lavadero XXXX</h1>
        <h2>Comprobante de Turno</h2>
        <p><strong>Número de Turno:</strong> ${document.getElementById('numeroTurno').textContent}</p>
        <p><strong>Cliente:</strong> ${document.getElementById('clienteNombre').textContent}</p>
        <p><strong>Fecha:</strong> ${document.getElementById('fechaTurno').textContent}</p>
        <p><strong>Horario:</strong> ${document.getElementById('horarioTurno').textContent}</p>
        <p>Presente este comprobante al llegar al lavadero. Muchas gracias.</p>
    `;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
}

// Nuevo turno
function nuevoTurno() {
    document.getElementById('turnoForm').classList.remove('hidden');
    document.getElementById('turnoResult').classList.add('hidden');
}

// Verificar estado
document.getElementById('verificarForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const codigoTurno = document.getElementById('codigoTurno').value.toUpperCase();
    const turno = turnosDB.find(t => t.id === codigoTurno);
    
    if (turno) {
        document.getElementById('verNumeroTurno').textContent = turno.id;
        document.getElementById('verCliente').textContent = `${turno.nombre} ${turno.apellido}`;
        document.getElementById('verTelefono').textContent = turno.telefono;
        document.getElementById('verVehiculo').textContent = `${turno.marca} ${turno.modelo} (${turno.vehiculo})`;
        document.getElementById('verProblema').textContent = turno.problema;
        document.getElementById('verFechaTurno').textContent = `${formatearFecha(turno.fecha)} a las ${turno.horario}`;
        
        const ultimaActualizacion = turno.actualizaciones[turno.actualizaciones.length - 1];
        document.getElementById('verUltimaActualizacion').textContent = ultimaActualizacion.fecha;
        
        let estadoElement = document.getElementById('verEstado');
        estadoElement.textContent = turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1);
        estadoElement.className = '';
        
        switch(turno.estado) {
            case 'pendiente':
                estadoElement.classList.add('estado-pendiente');
                break;
            case 'terminado':
                estadoElement.classList.add('estado-terminado');
                break;
            case 'listo para retirar':
                estadoElement.classList.add('estado-listo');
                break;
        }
        
        document.getElementById('verificarForm').classList.add('hidden');
        document.getElementById('estadoResult').classList.remove('hidden');
    } else {
        alert('No se encontró un turno con ese código. Por favor, verifique el número e intente nuevamente.');
    }
});

// Nueva verificación
function nuevaVerificacion() {
    document.getElementById('verificarForm').reset();
    document.getElementById('verificarForm').classList.remove('hidden');
    document.getElementById('estadoResult').classList.add('hidden');
}

// Administración
function mostrarTurnos() {
    document.getElementById('listaTurnos').classList.remove('hidden');
    document.getElementById('formCambioEstado').classList.add('hidden');
    cargarTablaTurnos();
}

function mostrarFormEstado() {
    document.getElementById('listaTurnos').classList.add('hidden');
    document.getElementById('formCambioEstado').classList.remove('hidden');
    document.getElementById('cambioEstadoForm').reset();
}

function cancelarCambioEstado() {
    mostrarTurnos();
}

function cargarTablaTurnos(filtro = '') {
    const tbody = document.getElementById('turnosTableBody');
    tbody.innerHTML = '';
    
    let turnosFiltrados = turnosDB;
    
    if (filtro) {
        const busqueda = filtro.toLowerCase();
        turnosFiltrados = turnosDB.filter(t => 
            t.id.toLowerCase().includes(busqueda) || 
            t.nombre.toLowerCase().includes(busqueda) || 
            t.apellido.toLowerCase().includes(busqueda) || 
            t.telefono.includes(busqueda)
        );
    }
    
    turnosFiltrados.forEach(turno => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${turno.id}</td>
            <td>${turno.nombre} ${turno.apellido}</td>
            <td>${turno.telefono}</td>
            <td>${turno.marca} ${turno.modelo}</td>
            <td>${new Date(turno.fecha).toLocaleDateString('es-ES')} ${turno.horario}</td>
            <td class="estado-${turno.estado.replace(/ /g, '-')}">${turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}</td>
            <td class="acciones-cell">
                <button onclick="editarTurno('${turno.id}')" class="btn small"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function filtrarTurnos() {
    const filtro = document.getElementById('searchTurno').value;
    cargarTablaTurnos(filtro);
}

function editarTurno(id) {
    const turno = turnosDB.find(t => t.id === id);
    if (!turno) return;
    
    document.getElementById('adminCodigoTurno').value = turno.id;
    document.getElementById('nuevoEstado').value = turno.estado;
    
    mostrarFormEstado();
}

document.getElementById('cambioEstadoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const codigoTurno = document.getElementById('adminCodigoTurno').value.toUpperCase();
    const nuevoEstado = document.getElementById('nuevoEstado').value;
    const comentario = document.getElementById('comentario').value;
    
    const turnoIndex = turnosDB.findIndex(t => t.id === codigoTurno);
    
    if (turnoIndex !== -1) {
        turnosDB[turnoIndex].estado = nuevoEstado;
        turnosDB[turnoIndex].actualizaciones.push({
            fecha: new Date().toLocaleString('es-ES'),
            mensaje: `Estado cambiado a "${nuevoEstado}". ${comentario ? 'Comentario: ' + comentario : ''}`
        });
        
        localStorage.setItem('turnosDB', JSON.stringify(turnosDB));
        alert('Estado actualizado correctamente');
        mostrarTurnos();
        cargarTablaTurnos();
    } else {
        alert('No se encontró el turno especificado');
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha mínima en el campo de fecha (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').min = hoy;
    
    // Cargar tabla de turnos al abrir la pestaña de administración
    document.getElementById('adminTab').addEventListener('click', function() {
        cargarTablaTurnos();
    });
    
    // Simular algunos turnos para demostración
    if (turnosDB.length === 0) {
        const fechaDemo = new Date();
        fechaDemo.setDate(fechaDemo.getDate() + 2);
        
        const turnoDemo = {
            id: 'ABC1234',
            nombre: 'Juan',
            apellido: 'Pérez',
            telefono: '5551234567',
            email: 'juan@example.com',
            vehiculo: 'auto',
            marca: 'Toyota',
            modelo: 'Corolla',
            problema: 'Cambio de aceite y revisión de frenos',
            fecha: fechaDemo.toISOString().split('T')[0],
            horario: '10:30',
            fechaIngreso: new Date().toLocaleDateString('es-ES'),
            estado: 'en revision',
            actualizaciones: [
                {
                    fecha: new Date().toLocaleString('es-ES'),
                    mensaje: 'Turno asignado. Pendiente de revisión.'
                },
                {
                    fecha: new Date().toLocaleString('es-ES'),
                    mensaje: 'Vehículo en revisión. Se detectó necesidad de cambiar pastillas de frenos.'
                }
            ]
        };
        
        turnosDB.push(turnoDemo);
        localStorage.setItem('turnosDB', JSON.stringify(turnosDB));
    }
});