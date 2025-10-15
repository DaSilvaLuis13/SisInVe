import { useState, useEffect } from "react";
import Busqueda from "../components/Busqueda";
import { supabase } from "../services/client";

function MovimientoInventario() {
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("Productos")
        .select(
          "id, codigo_barras, nombre, unidad_medida, stock_minimo, stock_maximo, stock_actual"
        )
        .order("id", { ascending: true });
      if (!error) setProductos(data);
    };
    fetchProductos();
  }, []);

  const manejarSeleccion = (producto) => {
    setProductoSeleccionado({ ...producto, cantidad: 1 });
    setMostrarBusqueda(false);
  };

  const actualizarCantidad = (cantidad) => {
    setProductoSeleccionado({ ...productoSeleccionado, cantidad: Number(cantidad) });
  };

  const actualizarStock = async () => {
    if (!tipoMovimiento || !productoSeleccionado) return;

    const ahora = new Date();
    const fechaSQL = ahora.toISOString().split("T")[0];
    const horaSQL = ahora.toTimeString().split(" ")[0];

    const movimiento = {
      id_producto: productoSeleccionado.id,
      fecha: fechaSQL,
      hora: horaSQL,
      tipo: tipoMovimiento,
      cantidad: productoSeleccionado.cantidad,
    };

    const { error: movError } = await supabase
      .from("MovimientosInventario")
      .insert([movimiento]);

    if (movError) {
      console.error("Error al registrar el movimiento:", movError);
      return;
    }

    const { data: prodData, error: prodError } = await supabase
      .from("Productos")
      .select("stock_actual, stock_minimo, stock_maximo")
      .eq("id", productoSeleccionado.id)
      .single();

    if (prodError) {
      console.error(`Error al obtener el producto ${productoSeleccionado.id}:`, prodError);
      return;
    }

    let stock = prodData.stock_actual;

    if (tipoMovimiento === "entrada") {
      stock += productoSeleccionado.cantidad;
      
    } else if (tipoMovimiento === "salida") {
      stock -= productoSeleccionado.cantidad;
      if (stock < 0) stock = 0;
      
    }

    const { error: updateError } = await supabase
      .from("Productos")
      .update({ stock_actual: stock })
      .eq("id", productoSeleccionado.id);

    if (updateError) {
      console.error(`Error al actualizar el stock del producto ${productoSeleccionado.id}:`, updateError);
    }

    // 🔹 Actualizar el estado local de productos para reflejar el cambio inmediatamente
    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoSeleccionado.id ? { ...p, stock_actual: stock } : p
      )
    );

    setProductoSeleccionado(null);
    setTipoMovimiento("");
  };

  // 🔹 Abrir búsqueda y mantener productos actualizados
  const abrirBusqueda = () => {
    setMostrarBusqueda(true);
  };

  return (
    <div>
      {/* Botones de movimiento */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
            <button
              className={`btn btn-success ${tipoMovimiento === "entrada" ? "active" : ""}`}
              onClick={() => setTipoMovimiento("entrada")}
            >
              Entrada
            </button>
            <button
              className={`btn btn-primary ${tipoMovimiento === "salida" ? "active" : ""}`}
              onClick={() => setTipoMovimiento("salida")}
            >
              Salida
            </button>
            <button
              className="btn btn-warning"
              onClick={() => setProductoSeleccionado(null)}
            >
              Cancelar
            </button>
          </div>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            {tipoMovimiento && productoSeleccionado && (
              <button className="btn btn-info" onClick={actualizarStock}>
                Confirmar {tipoMovimiento}
              </button>
            )}
            <button className="btn btn-secondary" onClick={abrirBusqueda}>
              Buscar Producto
            </button>
          </div>
        </div>
      </div>

      {/* Producto seleccionado */}
      {productoSeleccionado && (
        <div className="mb-4">
          <h5 className="text-center mb-3">Producto seleccionado</h5>
          <div className="card p-3 shadow-sm">
            <div className="row align-items-center">
              <div className="col-md-4 mb-2 mb-md-0">
                <strong>{productoSeleccionado.nombre}</strong> <br />
                Código: {productoSeleccionado.codigo_barras} <br />
                Unidad: {productoSeleccionado.unidad_medida}
              </div>

              <div className="col-md-3 mb-2 mb-md-0">
                Stock actual: <strong>{productoSeleccionado.stock_actual}</strong> <br />
                Mínimo: {productoSeleccionado.stock_minimo} | Máximo: {productoSeleccionado.stock_maximo}
              </div>

              <div className="col-md-3 mb-2 mb-md-0">
                <label className="form-label mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={productoSeleccionado.cantidad}
                  onChange={(e) => actualizarCantidad(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-md-2 d-flex justify-content-end">
                <button
                  className="btn btn-danger"
                  onClick={() => setProductoSeleccionado(null)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de búsqueda */}
      {mostrarBusqueda && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
          <div className="bg-white p-4 rounded shadow w-75">
            <h5>Buscar Producto</h5>
            <Busqueda datos={productos} onSeleccionar={manejarSeleccion} mostrarStock={true} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setMostrarBusqueda(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovimientoInventario;
