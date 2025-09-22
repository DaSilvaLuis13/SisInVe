//Aquí van los import que necesites incorporar elementos de la carpeta components
import { useState, useEffect } from 'react'
import { supabase } from '../services/client'
import { useNavigate } from "react-router-dom";

/* 
Formulario de consulta/listado de clientes con barra de búsqueda
*/

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

      if (error) {
        console.error("Error al cargar proveedores:", error);
      } else {
        setProveedores(data);
      }
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

      setProveedores(prev => prev.filter(proveedor => proveedor.id !== id));
      console.log("Proveedor eliminado:", data);
    } catch (error) {
      console.log(error);
    }
  };

  // Filtrar clientes según el texto del input
  const proveedoresFiltrados = proveedores.filter(p =>
    p.empresa.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Lista de Proveedores</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre de empresa..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Teléfono</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.map((proveedor) => (
            <tr key={proveedor.id}>
              <td>{proveedor.empresa}</td>
              <td>{proveedor.telefono}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => cargarProveedor(proveedor)}
                >
                  Editar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
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
  )
}

export default ConsultaProveedores