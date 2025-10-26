import { useState, useEffect } from 'react';
import { supabase } from '../services/client';
import { useNavigate } from "react-router-dom";
import './consultaClientes.css'; // Tu CSS con variables de color

function ConsultaClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientesConDeuda = async () => {
      const { data, error } = await supabase
        .from("Clientes")
        .select("*")
        .order('id', { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error);
      } else {
        // Verificar deudas para cada cliente
        const clientesConDeuda = await Promise.all(
          data.map(async (c) => {
            const { data: saldoData } = await supabase
              .from("SaldoCliente")
              .select("monto_que_pagar")
              .eq("id_cliente", c.id);

            return {
              ...c,
              tieneDeuda: saldoData?.some(d => parseFloat(d.monto_que_pagar) > 0)
            };
          })
        );
        setClientes(clientesConDeuda);
      }
    };

    fetchClientesConDeuda();
  }, []);

  const cargarCliente = (cliente) => {
    navigate("/clientes", { state: { cliente } });
  };

  const eliminarCliente = async (id) => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("Clientes")
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      console.log("Cliente eliminado:", data);
    } catch (error) {
      console.log(error);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_paterno.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_materno.toLowerCase().includes(filtro.toLowerCase())
  );

    return (
  <div className="consulta-clientes-container py-5">
    <h2 className="consulta-clientes-title text-center mb-4">Lista de Clientes</h2>

    {/* Barra de búsqueda */}
    <div className="mb-3 text-center">
      <input
        type="text"
        className="form-control consulta-clientes-search"
        placeholder="Buscar por nombre o apellido..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
    </div>

    {/* Tabla responsive */}
    <div className="table-responsive consulta-clientes-table-wrapper">
      <table className="table table-striped table-hover consulta-clientes-table">
        <thead className="consulta-clientes-thead">
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Domicilio</th>
            <th>Teléfono</th>
            <th>Límite de Crédito</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr key={cliente.id} className="consulta-clientes-row">
              <td>{cliente.nombres}</td>
              <td>{cliente.apellido_paterno}</td>
              <td>{cliente.apellido_materno}</td>
              <td>{cliente.domicilio}</td>
              <td>{cliente.telefono}</td>
              <td className={cliente.limite_credito < 1000 ? "consulta-clientes-stock-bajo" : "consulta-clientes-stock-alto"}>
                {cliente.limite_credito}
              </td>
              <td>
                <button
                  type="button"
                  className="consulta-clientes-btn consulta-clientes-btn-seleccionar"
                  onClick={() => cargarCliente(cliente)}
                >
                  Seleccionar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className={`consulta-clientes-btn consulta-clientes-btn-eliminar ${cliente.tieneDeuda ? "consulta-clientes-btn-disabled" : ""}`}
                  onClick={() => !cliente.tieneDeuda && eliminarCliente(cliente.id)}
                  disabled={cliente.tieneDeuda}
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

export default ConsultaClientes;
