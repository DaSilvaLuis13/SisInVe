//Aquí van los import que necesites incorporar elementos de la carpeta components

/* 
Formulario de consulta/listado
Buscar productos por nombre o código
Ver stock disponible
*/

import { useState, useEffect } from 'react'
import { supabase } from '../services/client'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Necesario para el botón de ir a registrar

/* Formulario de consulta/listado de productos con barra de búsqueda
*/

function ConsultaProductos() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función principal para cargar los productos de Supabase
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Productos") // Asegúrate de que el nombre de la tabla sea 'Productos'
        .select("*")
        .order('id', { ascending: true });

      if (error) {
        console.error("Error al cargar productos:", error);
        // Podrías lanzar un alert aquí si quieres que el usuario lo vea
      } else {
        setProductos(data);
      }
    } catch (err) {
      console.error("Error inesperado al obtener productos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar los productos al montar el componente
  useEffect(() => {
    fetchProductos();
  }, []);

  // Navegar al formulario de registro/edición de productos
  const cargarProducto = (producto) => {
    // La ruta debe coincidir con la que uses para el formulario de productos
    navigate("/productos", { state: { producto } });
  };

  // Eliminar un producto de la base de datos
  const eliminarProducto = async (id, nombre) => {
    if (!id) return;

    if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto: ${nombre}?`)) {
        return;
    }

    try {
      const { error } = await supabase
        .from("Productos")
        .delete()
        .eq('id', id); // Asumiendo que la columna de ID es 'id'

      if (error) throw error;

      // Actualizar la lista de productos en el estado
      setProductos(prev => prev.filter(p => p.id !== id));
      console.log(`Producto con ID ${id} eliminado.`);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(`Hubo un error al eliminar el producto: ${error.message}`);
    }
  };

  // Filtrar productos según el texto del input (Nombre o Código de Barras)
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(filtro)) // Búsqueda por Código de Barras
  );

  if (loading) {
    return <div className="container mt-4 text-center">Cargando productos...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Lista de Productos ({productosFiltrados.length})</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o código de barras..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {productos.length === 0 ? (
        <div className="alert alert-info">No hay productos registrados.</div>
      ) : (
        <table className="table table-striped table-hover table-sm">
          <thead>
            <tr>
              <th>Cód. Barras</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Stock Min/Max</th>
              <th>Stock Actual</th>
              <th className='text-center'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id}>
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
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => cargarProducto(p)}
                    >
                      Seleccionar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
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
      )}
    </div>
  )
}

export default ConsultaProductos;