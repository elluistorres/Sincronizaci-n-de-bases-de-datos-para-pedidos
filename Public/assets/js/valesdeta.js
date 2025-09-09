// ✅ MODIFICACIÓN: Escuchar el evento personalizado
window.addEventListener('cargarDetalleVale', async function(e) {
    const { vale, filial, docto, serie } = e.detail;
    
    // Referencias al modal y al contenedor
    const detalleModal = new bootstrap.Modal(document.getElementById('detalleModal'));
    const modalTableContainer = document.getElementById('modal-table-container');

    // Limpiar y mostrar un mensaje de carga dentro del modal
    modalTableContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2 text-muted">Cargando detalle del vale ${vale}...</p>
        </div>
    `;

    // Muestra el modal ANTES de la petición
    detalleModal.show();

    try {
        // Realizar la petición al servidor
        const response = await fetch(`/api/valesdetalle/${vale}/${filial}/${docto}/${serie}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Pinta la tabla de resultados directamente en el modal
            const tablaHTML = `
                <div class="table-responsive">
                    <table class="table table-striped table-bordered table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Vale</th>
                                <th>Descripción</th>
                                <th>Pendiente</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.data.map(item => `
                                <tr>
                                    <td>${item.VAL_NUMERO}</td>
                                    <td>${item.VAD_DESCRIPCION}</td>
                                    <td>${item.PENDIENTE}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            modalTableContainer.innerHTML = tablaHTML;

        } else {
            // Muestra un mensaje si no hay datos
            modalTableContainer.innerHTML = `
                <div class="alert alert-info" role="alert">
                    No se encontraron datos para el vale ${vale}.
                </div>
            `;
        }
    } catch (error) {
        console.error("Error al cargar detalle del vale:", error);
        // Muestra un mensaje de error
        modalTableContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Hubo un error al cargar los datos. Por favor, inténtelo de nuevo.
            </div>
        `;
    }
});