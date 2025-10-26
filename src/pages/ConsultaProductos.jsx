import { useState, useEffect } from 'react'
import { supabase } from '../services/client'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./consultaProductos.css";

function ConsultaProductos() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Productos")
        .select("*")
        .order('id', { ascending: true });
      if (error) throw error;
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const cargarProducto = (producto) => {
    navigate("/productos", { state: { producto } });
  };

  const eliminarProducto = async (id, nombre) => {
    if (!id) return;
    if (!window.confirm(`¿Eliminar producto: ${nombre}?`)) return;
    try {
      const { error } = await supabase.from("Productos").delete().eq('id', id);
      if (error) throw error;
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert(`Error al eliminar el producto: ${error.message}`);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(filtro))
  );

  if (loading) return <div className="container-consulta text-center">Cargando productos...</div>;

  return (
  <div className="consulta-productos-container py-4">
    <h2 className="consulta-productos-title text-center mb-4">
      Lista de Productos ({productosFiltrados.length})
    </h2>

    {/* Barra de búsqueda */}
    <div className="mb-3 text-center">
      <input
        type="text"
        className="form-control consulta-productos-search"
        placeholder="Buscar por nombre o código de barras..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
    </div>

    {productos.length === 0 ? (
      <div className="consulta-productos-alert alert-info text-center">
        No hay productos registrados.
      </div>
    ) : (
      <div className="table-responsive consulta-productos-table-wrapper">
        <table className="table table-striped table-hover consulta-productos-table">
          <thead className="consulta-productos-thead">
            <tr>
              <th>Cód. Barras</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Stock Min/Max</th>
              <th>Stock Actual</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id} className="consulta-productos-row">
                <td>{p.codigo_barras || 'N/A'}</td>
                <td>{p.nombre}</td>
                <td>{p.unidad_medida}</td>
                <td>${p.costo ? p.costo.toFixed(2) : '0.00'}</td>
                <td>${p.precio_venta ? p.precio_venta.toFixed(2) : '0.00'}</td>
                <td>{p.stock_minimo || 0} / {p.stock_maximo || 'N/A'}</td>
                <td>{p.stock_actual}</td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="consulta-productos-btn consulta-productos-btn-seleccionar"
                      onClick={() => cargarProducto(p)}
                    >
                      Seleccionar
                    </button>
                    <button
                      className="consulta-productos-btn consulta-productos-btn-eliminar"
                      onClick={() => eliminarProducto(p.id, p.nombre)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);


}

export default ConsultaProductos;
