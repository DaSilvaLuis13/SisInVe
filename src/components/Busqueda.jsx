import { useState, useEffect } from "react";

function Busqueda({ datos, onSeleccionar }) {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState([]);

  // Efecto para filtrar los datos en tiempo real cuando el usuario escribe
  useEffect(() => {
    if (!datos) return;
    if (termino === "") {
      setResultados(datos); // Muestra todos los datos si no hay término de búsqueda
    } else {
      const filtered = datos.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(termino.toLowerCase())
      );
      setResultados(filtered);
    }
  }, [datos, termino]);

  // Determina si los datos son de clientes para mostrar las columnas correctas
  const esCliente = resultados.length > 0 && "apellido_paterno" in resultados[0];

  return (
    <div>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Escribe para buscar..."
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
      />

      <div style={{ maxHeight: 400, overflowY: "auto" }} className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead className="table-light position-sticky top-0">
            <tr>
              {esCliente ? (
                <>
                  <th>Nombre Completo</th>
                  <th>Límite Crédito</th>
                  <th></th>
                </>
              ) : (
                <>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Precio</th>
                  <th></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={esCliente ? 3 : 4} className="text-center text-muted">
                  Sin resultados
                </td>
              </tr>
            ) : (
              resultados.map((item) => (
                <tr key={item.id}>
                  {esCliente ? (
                    <>
                      <td>
                        {item.nombres} {item.apellido_paterno} {item.apellido_materno}
                      </td>
                      <td>${item.limite_credito?.toFixed(2) || "0.00"}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.nombre}</td>
                      <td>{item.codigo_barras}</td>
                      <td>${item.precio_venta?.toFixed(2) || "0.00"}</td>
                    </>
                  )}
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        onSeleccionar(item);
                        setTermino(""); // Limpia la búsqueda al seleccionar
                      }}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Busqueda;