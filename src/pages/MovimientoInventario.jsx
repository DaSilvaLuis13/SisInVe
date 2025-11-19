import { useState, useEffect } from "react";
import Busqueda from "../components/Busqueda";
import { supabase } from "../services/client";
import { useNavigate } from "react-router";
import "./movimientoInventario.css";
import {
  alertaExito,
  alertaError,
  alertaInfo,
} from "../utils/alerts"; // ✅ Importar tus alertas

function MovimientoInventario() {
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("");

  const navigate = useNavigate();

  const ayuda = () => {
    navigate("/ayuda#movimientosinv");
  };

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("Productos")
        .select(
          "id, codigo_barras, nombre, unidad_medida, stock_minimo, stock_maximo, stock_actual"
        )
        .order("id", { ascending: true });
      if (!error) setProductos(data);
      else {
        console.error("Error al obtener productos:", error);
        alertaError("No se pudieron cargar los productos del inventario.");
      }
    };
    fetchProductos();
  }, []);

  const manejarSeleccion = (producto) => {
    setProductoSeleccionado({ ...producto, cantidad: 1 });
    setMostrarBusqueda(false);
  };

  const actualizarCantidad = (cantidad) => {
    setProductoSeleccionado({
      ...productoSeleccionado,
      cantidad: Number(cantidad),
    });
  };

  const actualizarStock = async () => {
    if (!tipoMovimiento) {
      alertaInfo("Selecciona un tipo de movimiento (entrada o salida).");
      return;
    }

    if (!productoSeleccionado) {
      alertaInfo("Selecciona un producto para registrar el movimiento.");
      return;
    }

    if (!productoSeleccionado.cantidad || productoSeleccionado.cantidad <= 0) {
      alertaInfo("La cantidad debe ser mayor que 0.");
      return;
    }

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
      alertaError("Error al registrar el movimiento en la base de datos.");
      return;
    }

    const { data: prodData, error: prodError } = await supabase
      .from("Productos")
      .select("stock_actual, stock_minimo, stock_maximo")
      .eq("id", productoSeleccionado.id)
      .single();

    if (prodError) {
      console.error(
        `Error al obtener el producto ${productoSeleccionado.id}:`,
        prodError
      );
      alertaError("No se pudo obtener la información del producto.");
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
      console.error(
        `Error al actualizar el stock del producto ${productoSeleccionado.id}:`,
        updateError
      );
      alertaError("Error al actualizar el stock del producto.");
      return;
    }

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoSeleccionado.id ? { ...p, stock_actual: stock } : p
      )
    );

    setProductoSeleccionado(null);
    setTipoMovimiento("");

    alertaExito("Movimiento de inventario registrado correctamente.");
  };

  const abrirBusqueda = () => {
    setMostrarBusqueda(true);
  };

  return (
  <div className="movimiento-inventario-container container py-4">

    {/* Botones tipo movimiento */}
    <div className="movimiento-inventario-botones d-flex justify-content-center flex-wrap gap-2 mb-4">
      <button
        className={`mov-btn mov-btn-entrada ${tipoMovimiento === "entrada" ? "active" : ""}`}
        onClick={() => setTipoMovimiento("entrada")}
      >
        ➕ Entrada
      </button>
      <button
        className={`mov-btn mov-btn-salida ${tipoMovimiento === "salida" ? "active" : ""}`}
        onClick={() => setTipoMovimiento("salida")}
      >
        ➖ Salida
      </button>
      <button
        className="mov-btn mov-btn-cancel"
        onClick={() => setProductoSeleccionado(null)}
      >
        ✖ Cancelar
      </button>
    </div>

    {/* Acciones secundarias */}
    <div className="movimiento-inventario-acciones d-flex justify-content-center flex-wrap gap-2 mb-4">
      {tipoMovimiento && productoSeleccionado && (
        <button
          className="mov-btn mov-btn-confirm"
          onClick={actualizarStock}
        >
          ✅ Confirmar {tipoMovimiento}
        </button>
      )}
      <button className="mov-btn mov-btn-search" onClick={abrirBusqueda}>
        🔍 Buscar Producto
      </button>
      <button type="button" className="btn-ac" onClick={ayuda}>Ayuda</button>
    </div>

    {/* Card producto seleccionado */}
    {productoSeleccionado && (
      <div className="movimiento-inventario-card-producto card p-3 mb-4 shadow-sm">
        <h5 className="text-center mb-3">Producto Seleccionado</h5>
        <div className="movimiento-inventario-card-body d-flex flex-column gap-3 align-items-start text-center">

          {/* Información del producto */}
          <div className="movimiento-inventario-info-producto w-100">
            <strong>{productoSeleccionado.nombre}</strong> <br />
            Código: {productoSeleccionado.codigo_barras || "N/A"} <br />
            Unidad: {productoSeleccionado.unidad_medida}
          </div>

          {/* Stock */}
          <div className="movimiento-inventario-stock-producto w-100">
            Stock actual: <strong>{productoSeleccionado.stock_actual}</strong> <br />
            Mínimo: {productoSeleccionado.stock_minimo} | Máximo: {productoSeleccionado.stock_maximo}
            <div className="movimiento-inventario-progress-stock mt-1">
              <div
                className="movimiento-inventario-progress-stock-inner"
                style={{
                  width: `${Math.min(
                    (productoSeleccionado.stock_actual / productoSeleccionado.stock_maximo) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Cantidad */}
          <div className="movimiento-inventario-cantidad-producto w-100">
            <label className="form-label mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              value={productoSeleccionado.cantidad}
              onChange={(e) => actualizarCantidad(e.target.value)}
              className="movimiento-inventario-input-cantidad form-control"
            />
          </div>

          

        </div>
      </div>
    )}

    {/* Modal de búsqueda */}
    {mostrarBusqueda && (
      <div className="movimiento-inventario-modal-overlay modal-overlay">
        <div className="movimiento-inventario-modal-busqueda modal-busqueda">
          <h5>Buscar Producto</h5>
          <Busqueda
            datos={productos}
            onSeleccionar={manejarSeleccion}
            mostrarStock={true}
          />
          <div className="text-end mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => setMostrarBusqueda(false)}
            >
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
