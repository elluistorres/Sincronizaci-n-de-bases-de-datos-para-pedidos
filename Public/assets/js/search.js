document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const tableBody = document.getElementById('tableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const btnSoloPendientes = document.getElementById('btnSoloPendientes');
    
    // Variables para almacenar datos y estado
    let todosLosResultados = []; // Almacena TODOS los resultados originales
    let mostrandoSoloPendientes = false; // Estado del filtro

    // Mensaje inicial en la tabla
    const showInitialMessage = () => {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    Utilice los filtros superiores para iniciar una búsqueda.
                </td>
            </tr>
        `;
    };
    
    // Función para renderizar la tabla
    const renderizarTabla = (resultados) => {
        if (resultados.length > 0) {
            tableBody.innerHTML = resultados.map((registro, index) => {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${registro.filial || '-'}</td>
                        <td>${registro.docto || '-'}</td>
                        <td>${registro.serie || '-'}</td>
                        <td>${registro.emision || '-'}</td>
                        <td>${registro.cliente || '-'}</td>
                        <td>${registro.numbor || '-'}</td>
                        <td>${registro.chofer || '-'}</td>
                        <td>
                            ${registro.valesPendientes && registro.valesPendientes.length > 0
                                ? registro.valesPendientes.map(vale =>
                                    `<a href="#" class="vale-link" 
                                       data-vale="${vale}" 
                                       data-filial="${registro.filial}" 
                                       data-docto="${registro.docto}" 
                                       data-serie="${registro.serie}">
                                        ${vale}
                                    </a>`
                                  ).join('<br>')
                                : '-'}
                        </td>
                        <td>${registro.statusGeneral || '-'}</td>
                        <td>${registro.fechaEntrega || '-'}</td>
                    </tr>
                `;
            }).join('');
        } else {
            noResultsMessage.classList.remove('d-none');
            tableBody.innerHTML = '';
        }
    };
    
    // Función para alternar el filtro
    const toggleFiltro = () => {
        if (todosLosResultados.length === 0) {
            alert('Primero debe realizar una búsqueda.');
            return;
        }

        mostrandoSoloPendientes = !mostrandoSoloPendientes;
        
        if (mostrandoSoloPendientes) {
            // Filtrar solo los que tienen valesPendientes
            const soloConVales = todosLosResultados.filter(registro => 
                registro.valesPendientes && registro.valesPendientes.length > 0
            );
            
            btnSoloPendientes.textContent = 'Mostrar todos';
            btnSoloPendientes.classList.remove('btn-info');
            btnSoloPendientes.classList.add('btn-warning');
            
            noResultsMessage.classList.add('d-none');
            renderizarTabla(soloConVales);
            
            if (soloConVales.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="11" class="text-center text-muted py-4">
                            No se encontraron registros con vales pendientes.
                        </td>
                    </tr>
                `;
            }
        } else {
            // Mostrar todos los resultados originales
            btnSoloPendientes.textContent = 'Solo pendientes';
            btnSoloPendientes.classList.remove('btn-warning');
            btnSoloPendientes.classList.add('btn-info');
            
            noResultsMessage.classList.add('d-none');
            renderizarTabla(todosLosResultados);
        }
    };
    
    showInitialMessage();

    // Event listener para el botón "Solo pendientes"
    btnSoloPendientes.addEventListener('click', toggleFiltro);

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Resetear estado del filtro al hacer nueva búsqueda
        mostrandoSoloPendientes = false;
        btnSoloPendientes.textContent = 'Solo pendientes';
        btnSoloPendientes.classList.remove('btn-warning');
        btnSoloPendientes.classList.add('btn-info');
        
        // Obtener valores del formulario
        const searchParams = {
            docto: document.getElementById('docto').value.trim(),
            serie: document.getElementById('serie').value.trim(),
            fecha1: document.getElementById('fecha1').value,
            fecha2: document.getElementById('fecha2').value
        };

        // Lógica de validación
        const hasDocto = !!searchParams.docto;
        const hasSerie = !!searchParams.serie;
        const has1date = searchParams.fecha1;
        const hasDates = searchParams.fecha1 && searchParams.fecha2;

        if (hasSerie && hasDocto) {
            // válido, no pedimos fechas
        }
        else if (hasDocto || !hasSerie){
             alert('No puedes buscar solo por documento');
            return;
        }
         else if ((hasSerie || hasDocto) && has1date) {
            //correcto, solo se busca el dia de hoy
        }
        else if ((hasSerie || hasDocto) && !hasDates) {
            alert('Para buscar por Serie o Documento, debe seleccionar un rango de fechas.');
            return;
        }
        else if (!hasSerie && !hasDocto) {
            alert('Debe ingresar al menos Serie o Documento.');
            return;
        }

        // Mostrar carga y ocultar otros mensajes
        loadingMessage.classList.remove('d-none');
        tableBody.innerHTML = '';
        noResultsMessage.classList.add('d-none');

        try {
            // Realizar la petición al servidor
            const response = await axios.get('/search', { params: searchParams });
            const resultados = response.data;

            // Ocultar mensaje de carga
            loadingMessage.classList.add('d-none');

            // Guardar TODOS los resultados para el filtro
            todosLosResultados = resultados;

            // Renderizar tabla con todos los resultados
            renderizarTabla(resultados);
            
            // Limpiar formulario
            document.getElementById('docto').value = '';
            document.getElementById('serie').value = '';
            document.getElementById('fecha1').value = '';
            document.getElementById('fecha2').value = '';

        } catch (error) {
            // Manejo de errores
            loadingMessage.classList.add('d-none');
            console.error('Error:', error);
            
            let errorMessage = 'Error al realizar la búsqueda';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else {
                errorMessage = error.message || errorMessage;
            }

            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-danger">
                        ${errorMessage}
                    </td>
                </tr>
            `;
            
            todosLosResultados = [];
        }
    });

    // Delegación de eventos para vales (mantener igual)
    tableBody.addEventListener('click', function(e) {
        const link = e.target.closest('.vale-link');
        if (link) {
            e.preventDefault(); 
            
            const valeData = {
                vale: link.dataset.vale,
                filial: link.dataset.filial,
                docto: link.dataset.docto,
                serie: link.dataset.serie
            };
            
            const valeEvent = new CustomEvent('cargarDetalleVale', {
                detail: valeData
            });
            window.dispatchEvent(valeEvent);
        }
    });
});