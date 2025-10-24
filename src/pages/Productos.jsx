import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/client";

/*
Formulario de registro/edición de productos
Campos:
Código de barras, Nombre, Unidad de medida,
Costo, Ganancia, Precio de venta,
Stock mínimo / máximo
*/

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
  const [stockInicial, setStockInicial] = useState(""); // <-- stock inicial solo para creación

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

  // 🔁 Sincronización entre costo, ganancia y precio
  useEffect(() => {
    const c = Number(costo) || 0;
    const g = Number(ganancia) || 0;
    if (c > 0 && document.activeElement?.id === "ganancia") {
      const nuevoPrecio = c + (c * g) / 100;
      if (nuevoPrecio.toFixed(2) !== precioVenta) {
        setPrecioVenta(nuevoPrecio.toFixed(2));
      }
    }
  }, [ganancia]);

  useEffect(() => {
    const c = Number(costo) || 0;
    const pv = Number(precioVenta) || 0;
    if (c > 0 && document.activeElement?.id === "precioVenta") {
      const nuevoPorcentaje = ((pv - c) / c) * 100;
      if (nuevoPorcentaje.toFixed(2) !== ganancia) {
        setGanancia(nuevoPorcentaje.toFixed(2));
      }
    }
  }, [precioVenta]);

  useEffect(() => {
    const c = Number(costo) || 0;
    const g = Number(ganancia) || 0;
    if (c > 0 && document.activeElement?.id === "costo") {
      const nuevoPrecio = c + (c * g) / 100;
      if (nuevoPrecio.toFixed(2) !== precioVenta) {
        setPrecioVenta(nuevoPrecio.toFixed(2));
      }
    }
  }, [costo]);

  // 🧮 Crear producto
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
        stock_actual: stockInicial === "" ? 0 : Number(stockInicial), // <-- stock inicial
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

  // 🧩 Actualizar producto
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
          // stock_actual NO se toca aquí
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

  // 📦 Cargar producto si viene desde "consulta-productos"
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
    <div className="container mt-4">
  <h2 className="text-center mb-4">
    {idProducto ? "Editar Producto" : "Registrar Producto"}
  </h2>

  <form onSubmit={idProducto ? actualizarProducto : crearProducto}>
    <div className="row g-3">
      {/* Código de barras */}
      <div className="col-md-6 col-lg-4">
        <label htmlFor="codigoBarras" className="form-label">Código de Barras (opcional)</label>
        <input
          type="text"
          className="form-control"
          id="codigoBarras"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
        />
      </div>

      {/* Nombre */}
      <div className="col-md-6 col-lg-8">
        <label htmlFor="nombre" className="form-label">Nombre *</label>
        <input
          type="text"
          className="form-control"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {/* Unidad de medida */}
      <div className="col-md-6 col-lg-4">
        <label htmlFor="unidadMedida" className="form-label">Unidad de Medida *</label>
        <select
          id="unidadMedida"
          className="form-select"
          value={unidadMedida}
          onChange={(e) => setUnidadMedida(e.target.value)}
          required
        >
          <option value="">Seleccione una unidad...</option>
          <option value="piezas">Piezas</option>
          <option value="kilos">Kilos</option>
          <option value="litros">Litros</option>
        </select>
      </div>

      {/* Costo */}
      <div className="col-md-4 col-lg-2">
        <label htmlFor="costo" className="form-label">Costo *</label>
        <input
          type="number"
          className="form-control"
          id="costo"
          min={0}
          step="0.01"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          required
        />
      </div>

      {/* Ganancia */}
      <div className="col-md-4 col-lg-2">
        <label htmlFor="ganancia" className="form-label">Ganancia (%) *</label>
        <input
          type="number"
          className="form-control"
          id="ganancia"
          min={0}
          step="0.01"
          value={ganancia}
          onChange={(e) => setGanancia(e.target.value)}
          required
        />
      </div>

      {/* Precio de venta */}
      <div className="col-md-4 col-lg-2">
        <label htmlFor="precioVenta" className="form-label">Precio Venta *</label>
        <input
          type="number"
          className="form-control"
          id="precioVenta"
          min={0}
          step="0.01"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
          required
        />
      </div>

      {/* Stock inicial (solo al crear producto) */}
      {!idProducto && (
        <div className="col-md-4 col-lg-2">
          <label htmlFor="stockInicial" className="form-label">Stock Inicial</label>
          <input
            type="number"
            className="form-control"
            id="stockInicial"
            min={0}
            value={stockInicial}
            onChange={(e) => setStockInicial(e.target.value)}
          />
        </div>
      )}

      {/* Stock mínimo */}
      <div className="col-md-4 col-lg-2">
        <label htmlFor="stockMinimo" className="form-label">Stock Mínimo</label>
        <input
          type="number"
          className="form-control"
          id="stockMinimo"
          min={0}
          value={stockMinimo}
          onChange={(e) => setStockMinimo(e.target.value)}
        />
      </div>

      {/* Stock máximo */}
      <div className="col-md-4 col-lg-2">
        <label htmlFor="stockMaximo" className="form-label">Stock Máximo</label>
        <input
          type="number"
          className="form-control"
          id="stockMaximo"
          min={0}
          value={stockMaximo}
          onChange={(e) => setStockMaximo(e.target.value)}
        />
      </div>
    </div>

    {/* Botones */}
    <div className="d-flex justify-content-center gap-2 mt-4">
      <button
        type="submit"
        className={`btn ${idProducto ? "btn-success" : "btn-primary"}`}
      >
        {idProducto ? "Actualizar" : "Crear"}
      </button>
      <Link to="/consulta-productos" className="btn btn-secondary">
        Consultar Productos
      </Link>
      <Link to="/" className="btn btn-danger">
        X
      </Link>
    </div>
  </form>
</div>

  );
}

export default Productos;
