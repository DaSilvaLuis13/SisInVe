import { useState, useEffect } from 'react'
import { supabase } from '../services/client'
import { useNavigate } from "react-router-dom"
import "./consulta-proveedores.css"

function ConsultaProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase
        .from("Proveedores")
        .select("*")
        .order('id', { ascending: true });

      if (error) console.error("Error al cargar proveedores:", error);
      else setProveedores(data);
    };

    fetchProveedores();
  }, []);

  const cargarProveedor = (proveedor) => {
    navigate("/proveedores", { state: { proveedor } });
  };

  const eliminarProveedor = async (id) => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("Proveedores")
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProveedores(prev => prev.filter(p => p.id !== id));
      console.log("Proveedor eliminado:", data);
    } catch (error) {
      console.error(error);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.empresa.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
  <div className="consulta-proveedores-container py-4">
    <h2 className="consulta-proveedores-title text-center mb-4">
      Lista de Proveedores
    </h2>

    {/* Input de búsqueda */}
    <div className="mb-3 text-center">
      <input
        type="text"
        className="form-control consulta-proveedores-search"
        placeholder="Buscar por nombre de empresa..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
    </div>

    {/* Tabla responsive */}
    <div className="table-responsive consulta-proveedores-table-wrapper">
      <table className="table table-striped table-hover consulta-proveedores-table">
        <thead className="consulta-proveedores-thead">
          <tr>
            <th>Empresa</th>
            <th>Teléfono</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.map((proveedor) => (
            <tr key={proveedor.id} className="consulta-proveedores-row">
              <td>{proveedor.empresa}</td>
              <td>{proveedor.telefono}</td>
              <td>
                <button
                  type="button"
                  className="consulta-proveedores-btn consulta-proveedores-btn-seleccionar"
                  onClick={() => cargarProveedor(proveedor)}
                >
                  Seleccionar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className="consulta-proveedores-btn consulta-proveedores-btn-eliminar"
                  onClick={() => eliminarProveedor(proveedor.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


}

export default ConsultaProveedores;
