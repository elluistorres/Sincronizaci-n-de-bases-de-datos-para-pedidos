document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const tableBody = document.getElementById('tableBody');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const searchParams = {
            docto: document.getElementById('docto').value.trim(),
            serie: document.getElementById('serie').value.trim(),
            fecha1: document.getElementById('fecha1').value,
            fecha2: document.getElementById('fecha2').value
        };

        // Validaciones
        if (!searchParams.serie) {
            alert('El campo Serie es obligatorio');
            document.getElementById('serie').focus();
            return;
        }

        if (!searchParams.fecha1 && !searchParams.fecha2) {
            alert('Debe seleccionar al menos una fecha');
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
                tableBody.innerHTML = resultados.map((registro, index) => `
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
                        <td>${registro.valesPendientes || '-'}</td>
                        <td>${registro.statusGeneral || '-'}</td>
                    </tr>
                `).join('');
            } else {
                // Mostrar mensaje de no resultados
                noResultsMessage.classList.remove('d-none');
            }
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
});