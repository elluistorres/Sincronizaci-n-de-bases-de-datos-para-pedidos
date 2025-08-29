async function cargarValesDetalle() {
  const pathParts = window.location.pathname.split("/"); 
  const vale = pathParts[2];
  const filial = pathParts[3];
  const docto = pathParts[4];
  const serie = pathParts[5];

  console.log("Parametros URL:", vale, filial, docto, serie); // 🔍 Debug

  const response = await fetch(`/api/valesdetalle/${vale}/${filial}/${docto}/${serie}`);
  const data = await response.json();

  const contenedor = document.getElementById("valesDetalleContainer");

  if (data.success && data.data.length > 0) {
    let tabla = `
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Vale</th>
          <th>Descripción</th>
          <th>Pendiente</th>
        </tr>
    `;

    data.data.forEach(item => {
      tabla += `
        <tr>
          <td>${item.VAL_NUMERO}</td>
          <td>${item.VAD_DESCRIPCION}</td>
          <td>${item.PENDIENTE}</td>
        </tr>
      `;
    });

    tabla += "</table>";
    contenedor.innerHTML = tabla;
  } else {
    contenedor.innerHTML = "<p>No se encontraron datos.</p>";
  }
}

document.addEventListener("DOMContentLoaded", cargarValesDetalle);

