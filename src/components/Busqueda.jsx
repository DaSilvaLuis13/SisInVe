import { useState, useEffect } from "react";

function Busqueda({ datos, onSeleccionar }) {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState([]);

  // Filtrado en tiempo real
  useEffect(() => {
    if (!datos) return;
    const filtered = datos.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(termino.toLowerCase())
    );
    setResultados(filtered);
  }, [datos, termino]);

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

      <div style={{ maxHeight: 300, overflowY: "auto" }} className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead className="table-light">
            <tr>
              {esCliente ? (
                <>
                  <th>Nombre</th>
                  <th>Límite Crédito</th>
                  <th></th>
                </>
              ) : (
                <>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Unidad</th>
                  <th>Precio</th>
                  <th></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={esCliente ? 3 : 5} className="text-center">
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
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onSeleccionar(item)}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.nombre}</td>
                      <td>{item.codigo_barras}</td>
                      <td>{item.unidad_medida}</td>
                      <td>${item.precio_venta?.toFixed(2) || "0.00"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onSeleccionar(item)}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </>
                  )}
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
