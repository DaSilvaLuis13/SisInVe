import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/client";
import "./productos.css";

function Productos() {
  const [idProducto, setIdProducto] = useState(null);
  const [codigoBarras, setCodigoBarras] = useState("");
  const [nombre, setNombre] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [costo, setCosto] = useState("");
  const [ganancia, setGanancia] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [stockMaximo, setStockMaximo] = useState("");
  const [stockInicial, setStockInicial] = useState("");

  const location = useLocation();

  const limpiarFormulario = () => {
    setIdProducto(null);
    setCodigoBarras("");
    setNombre("");
    setUnidadMedida("");
    setCosto("");
    setGanancia("");
    setPrecioVenta("");
    setStockMinimo("");
    setStockMaximo("");
    setStockInicial("");
  };

const navigate = useNavigate();

const ayuda = () => {
  navigate('/ayuda#registrar');
};

  useEffect(() => {
    const c = Number(costo) || 0;
    const g = Number(ganancia) || 0;
    if (c > 0 && document.activeElement?.id === "ganancia") {
      const nuevoPrecio = c + (c * g) / 100;
      if (nuevoPrecio.toFixed(2) !== precioVenta) setPrecioVenta(nuevoPrecio.toFixed(2));
    }
  }, [ganancia]);

  useEffect(() => {
    const c = Number(costo) || 0;
    const pv = Number(precioVenta) || 0;
    if (c > 0 && document.activeElement?.id === "precioVenta") {
      const nuevoPorcentaje = ((pv - c) / c) * 100;
      if (nuevoPorcentaje.toFixed(2) !== ganancia) setGanancia(nuevoPorcentaje.toFixed(2));
    }
  }, [precioVenta]);

  useEffect(() => {
    const c = Number(costo) || 0;
    const g = Number(ganancia) || 0;
    if (c > 0 && document.activeElement?.id === "costo") {
      const nuevoPrecio = c + (c * g) / 100;
      if (nuevoPrecio.toFixed(2) !== precioVenta) setPrecioVenta(nuevoPrecio.toFixed(2));
    }
  }, [costo]);

  const crearProducto = async (e) => {
    e.preventDefault();
    if (!nombre || !unidadMedida || !costo || !ganancia || !precioVenta) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    const min = stockMinimo === "" ? 0 : Number(stockMinimo);
    const max = stockMaximo === "" ? null : Number(stockMaximo);
    if (max !== null && min > max) {
      alert("El stock mínimo no puede ser mayor que el máximo.");
      return;
    }

    try {
      const { data, error } = await supabase.from("Productos").insert({
        codigo_barras: codigoBarras || null,
        nombre,
        unidad_medida: unidadMedida,
        costo: Number(costo),
        ganancia: Number(ganancia),
        precio_venta: Number(precioVenta),
        stock_minimo: min,
        stock_maximo: max,
        stock_actual: stockInicial === "" ? 0 : Number(stockInicial),
      });

      if (error) throw error;
      limpiarFormulario();
      alert("✅ Producto registrado con éxito.");
      console.log("Producto creado:", data);
    } catch (error) {
      alert(`❌ Error al registrar el producto: ${error.message}`);
      console.error(error);
    }
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    if (!idProducto) {
      alert("Primero selecciona un producto para actualizar.");
      return;
    }
    const min = stockMinimo === "" ? 0 : Number(stockMinimo);
    const max = stockMaximo === "" ? null : Number(stockMaximo);
    if (max !== null && min > max) {
      alert("El stock mínimo no puede ser mayor que el máximo.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("Productos")
        .update({
          codigo_barras: codigoBarras || null,
          nombre,
          unidad_medida: unidadMedida,
          costo: Number(costo),
          ganancia: Number(ganancia),
          precio_venta: Number(precioVenta),
          stock_minimo: min,
          stock_maximo: max,
        })
        .eq("id", idProducto);

      if (error) throw error;
      limpiarFormulario();
      alert("✅ Producto actualizado con éxito.");
      console.log("Producto actualizado:", data);
    } catch (error) {
      alert(`❌ Error al actualizar el producto: ${error.message}`);
      console.error(error);
    }
  };

  useEffect(() => {
    if (location.state?.producto) {
      const p = location.state.producto;
      setIdProducto(p.id);
      setCodigoBarras(p.codigo_barras || "");
      setNombre(p.nombre);
      setUnidadMedida(p.unidad_medida);
      setCosto(p.costo.toString());
      setGanancia(p.ganancia.toString());
      setPrecioVenta(p.precio_venta.toString());
      setStockMinimo(p.stock_minimo?.toString() || "");
      setStockMaximo(p.stock_maximo?.toString() || "");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
  <div className="container container-productos py-4"> {/* container de Bootstrap + clase propia */}
    <h1 className="text-center title-productos">
      {idProducto ? "Editar Producto" : "Registrar Producto"}
    </h1>

    <form onSubmit={idProducto ? actualizarProducto : crearProducto}>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"> {/* Bootstrap */}

        <div className="col"> {/* Bootstrap */}
          <label htmlFor="codigoBarras" className="form-label">Código de Barras</label> {/* Bootstrap */}
          <input type="text" className="form-control input-productos" id="codigoBarras" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} /> {/* Bootstrap + clase propia */}
        </div>

        <div className="col">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input type="text" className="form-control input-productos" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="col">
          <label htmlFor="unidadMedida" className="form-label">Unidad de Medida</label>
          <select className="form-select select-productos" id="unidadMedida" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} required>
            <option value="">Seleccione...</option>
            <option value="piezas">Piezas</option>
            <option value="kilos">Kilos</option>
            <option value="litros">Litros</option>
          </select>
        </div>

        <div className="col">
          <label htmlFor="costo" className="form-label">Costo</label>
          <input type="number" className="form-control input-productos" id="costo" min={0} step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} required />
        </div>

        <div className="col">
          <label htmlFor="ganancia" className="form-label">Ganancia (%)</label>
          <input type="number" className="form-control input-productos" id="ganancia" min={0} step="0.01" value={ganancia} onChange={(e) => setGanancia(e.target.value)} required />
        </div>

        <div className="col">
          <label htmlFor="precioVenta" className="form-label">Precio Venta</label>
          <input type="number" className="form-control input-productos" id="precioVenta" min={0} step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required />
        </div>

        {!idProducto && (
          <div className="col">
            <label htmlFor="stockInicial" className="form-label">Stock Inicial</label>
            <input type="number" className="form-control input-productos" id="stockInicial" min={0} value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} />
          </div>
        )}

        <div className="col">
          <label htmlFor="stockMinimo" className="form-label">Stock Mínimo</label>
          <input type="number" className="form-control input-productos" id="stockMinimo" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
        </div>

        <div className="col">
          <label htmlFor="stockMaximo" className="form-label">Stock Máximo</label>
          <input type="number" className="form-control input-productos" id="stockMaximo" min={0} value={stockMaximo} onChange={(e) => setStockMaximo(e.target.value)} />
        </div>

      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="d-flex justify-content-center gap-3 flex-grow-1">
          <button type="submit" className={`btn-ac ${idProducto ? "btn-success-actualizar" : "btn-primary"}`}>
            {idProducto ? "Actualizar" : "Crear"}
          </button>
          <Link to="/consulta-productos" className="btn-secondary btn-c">Consultar</Link>
          <button type="button" className="btn-danger btn-cancelar" onClick={limpiarFormulario}>Cancelar</button>
        </div>
        <button type="button" className="btn-ac" onClick={ayuda}>Ayuda</button>
      </div>
    </form>
  </div>
);

}

export default Productos;
