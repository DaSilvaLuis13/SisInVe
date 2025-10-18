import { useState, useEffect } from "react";

<<<<<<< HEAD
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
=======
function Busqueda({ datos, onSeleccionar, mostrarStock = false }) {
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

>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
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

<<<<<<< HEAD
      <div style={{ maxHeight: 400, overflowY: "auto" }} className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead className="table-light position-sticky top-0">
            <tr>
              {esCliente ? (
                <>
                  <th>Nombre Completo</th>
=======
      <div style={{ maxHeight: 300, overflowY: "auto" }} className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead className="table-light">
            <tr>
              {esCliente ? (
                <>
                  <th>Nombre</th>
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
                  <th>Límite Crédito</th>
                  <th></th>
                </>
              ) : (
                <>
<<<<<<< HEAD
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Precio</th>
=======
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Unidad</th>
                  {mostrarStock ? <th>Stock</th> : <th>Precio</th>}
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
                  <th></th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
<<<<<<< HEAD
                <td colSpan={esCliente ? 3 : 4} className="text-center text-muted">
=======
                <td colSpan={esCliente ? 3 : 5} className="text-center">
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
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
<<<<<<< HEAD
=======
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onSeleccionar(item)}
                        >
                          Seleccionar
                        </button>
                      </td>
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
                    </>
                  ) : (
                    <>
                      <td>{item.nombre}</td>
                      <td>{item.codigo_barras}</td>
<<<<<<< HEAD
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
=======
                      <td>{item.unidad_medida}</td>
                      <td>
                        {mostrarStock
                          ? item.stock_actual
                          : `$${item.precio_venta?.toFixed(2) || "0.00"}`}
                      </td>
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
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Busqueda;
=======
export default Busqueda;
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
