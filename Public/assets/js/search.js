document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const tableBody = document.getElementById('tableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Mensaje inicial en la tabla
    const showInitialMessage = () => {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
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
            fecha1: document.getElementById('fecha1').value,
            fecha2: document.getElementById('fecha2').value
        };

        // Lógica de validación
        const hasDocto = !!searchParams.docto;
        const hasSerie = !!searchParams.serie;
        const hasDates = searchParams.fecha1 && searchParams.fecha2;

        // Caso 1: Si busca por Serie + Docto (folio completo) → válido SIN fechas
        if (hasSerie && hasDocto) {
            // válido, no pedimos fechas
        }
        // Caso 2: Si busca SOLO por Serie o SOLO por Docto → deben venir las fechas
        else if ((hasSerie || hasDocto) && !hasDates) {
            alert('Para buscar por Serie o Documento, debe seleccionar un rango de fechas.');
            return;
        }
        // Caso 3: Si no puso ni Serie ni Docto → error
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
                            <td>${registro.fechaEntrega || '-'}</td>
                        </tr>
                    `;
                }).join('');
            } else {
                // Mostrar mensaje de no resultados
                noResultsMessage.classList.remove('d-none');
            }
            
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
                    <td colspan="12" class="text-center text-danger">
                        ${errorMessage}
                    </td>
                </tr>
            `;
        }
    });

    // ✅ MODIFICACIÓN: Delegación de eventos con Custom Event
    tableBody.addEventListener('click', function(e) {
        const link = e.target.closest('.vale-link');
        if (link) {
            e.preventDefault(); 
            
            // Obtener los datos de los atributos del enlace
            const valeData = {
                vale: link.dataset.vale,
                filial: link.dataset.filial,
                docto: link.dataset.docto,
                serie: link.dataset.serie
            };
            
            // ✅ NUEVO: Disparar evento personalizado
            const valeEvent = new CustomEvent('cargarDetalleVale', {
                detail: valeData
            });
            window.dispatchEvent(valeEvent);
        }
    });
});