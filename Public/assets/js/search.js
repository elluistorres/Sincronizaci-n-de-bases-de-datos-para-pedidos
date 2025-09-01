document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const tableBody = document.getElementById('tableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

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
    
    showInitialMessage();

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const searchParams = {
            docto: document.getElementById('docto').value.trim(),
            serie: document.getElementById('serie').value.trim(),
            numbor: document.getElementById('numbor').value.trim(), // Nuevo campo
            fecha1: document.getElementById('fecha1').value,
            fecha2: document.getElementById('fecha2').value
        };

        // Lógica de validación mejorada
        const hasSeriesOrDocto = searchParams.serie || searchParams.docto;
        const hasNumbor = searchParams.numbor;
        const hasDates = searchParams.fecha1 && searchParams.fecha2;
        
        // Si no se ha ingresado nada en serie, docto o bordero, no se puede buscar.
        if (!hasSeriesOrDocto && !hasNumbor) {
            alert('Por favor, ingrese un número de Serie, Documento o Bordero.');
            return;
        }

        // Si se busca por serie/docto, las fechas son obligatorias.
        if (hasSeriesOrDocto && !hasDates) {
            alert('Para buscar por Serie o Documento, debe seleccionar un rango de fechas.');
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

            if (resultados.length > 0) {
                // Llenar la tabla con los resultados
                tableBody.innerHTML = resultados.map((registro, index) => {
                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${registro.filial || '-'}</td>
                            <td>${registro.pedido || '-'}</td>
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
                        </tr>
                    `;
                }).join('');
            } else {
                // Mostrar mensaje de no resultados
                noResultsMessage.classList.remove('d-none');
            }
            // --- LÍNEAS AGREGADAS PARA BORRAR LOS INPUTS ---
    document.getElementById('docto').value = '';
    document.getElementById('serie').value = '';
    document.getElementById('numbor').value = '';
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
        }
    });

    // Delegación de eventos para manejar el clic en los enlaces de los vales
    tableBody.addEventListener('click', function(e) {
        const link = e.target.closest('.vale-link');
        if (link) {
            e.preventDefault(); 
            
            // Obtener los datos de los atributos del enlace
            const vale = link.dataset.vale;
            const filial = link.dataset.filial;
            const docto = link.dataset.docto;
            const serie = link.dataset.serie;
            
            // Llama a la función global en valesdeta.js
            if (typeof cargarValesDetalle === 'function') {
                cargarValesDetalle(vale, filial, docto, serie);
            } else {
                console.error("La función 'cargarValesDetalle' no está definida. Asegúrate de que valesdeta.js esté enlazado correctamente.");
            }
        }
    });
});