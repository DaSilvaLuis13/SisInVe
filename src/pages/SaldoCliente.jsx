//Aquí van los import que necesites incorporar elementos de la carpeta components
import { useState, useEffect } from 'react'
import { supabase } from "../services/client"
/* 
Formulario para registrar pagos o deudas
Selección de cliente
Monto a pagar o abonado
Fecha y hora (auto)
Asociación con corte de caja
*/

function SaldoCliente() {
  
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [saldoCliente, setSaldoCliente] = useState(null);
  const [compraReciente, setCompraReciente] = useState(null);

  
    useEffect(() => {
      const fetchClientes = async () => {
        const { data, error } = await supabase
          .from("Clientes")
          .select("id, nombres, apellido_paterno, apellido_materno, limite_credito")
          .order('id', { ascending: true });
  
        if (error) {
          console.error("Error al cargar clientes:", error);
        } else {
          setClientes(data);
        }
      };
  
      fetchClientes();
    }, []);

    useEffect(() => {
      if (!clienteSeleccionado) return;

      const fetchSaldo = async () => {
        const { data, error } = await supabase
          .from("SaldoCliente")
          .select("fecha, hora, monto_que_pagar")
          .eq("id_cliente", clienteSeleccionado.id);

        if (error) {
          console.error("Error al cargar saldo:", error);
        } else {
          // 👇 Aquí va el control del array vacío
          if (data.length === 0) {
            setSaldoCliente({ fecha: null, hora: null, monto_que_pagar: 0 });
          } else {
            setSaldoCliente(data[0]);
          }
        }
      };

      const fetchCompraReciente = async () => {
        const { data, error } = await supabase
          .from("Ventas")
          .select("fecha, hora, total")
          .eq("id_cliente", clienteSeleccionado.id)
          .eq("tipo_pago", "credito")
          .order("fecha", {ascending: false})
          .order("hora", {ascending: false})
          .limit(1);

        if (error) {
          console.error("Error al cargar compra reciente:", error);
        } else {
          // 👇 Aquí va el control del array vacío
          if (data.length === 0) {
            setCompraReciente(null);
          } else {
            setCompraReciente(data[0]);
          }
        }
      }

      fetchSaldo();
      fetchCompraReciente();
    }, [clienteSeleccionado]);



    // Filtrar clientes según el texto del input
  const clientesFiltrados = clientes.filter(c =>
    c.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_paterno.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_materno.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>SaldoCliente
      {/* Barra de búsqueda */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o apellido..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Límite de Crédito</th>
            <th>Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombres}</td>
              <td>{cliente.apellido_paterno}</td>
              <td>{cliente.apellido_materno}</td>
              <td>{cliente.limite_credito}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setClienteSeleccionado(cliente)}
                >
                  Selección
                </button>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>

      {clienteSeleccionado && (
        <section className="cliente">
          <h2>{clienteSeleccionado.nombres}</h2>
          <p><strong>Apellido Paterno:</strong> {clienteSeleccionado.apellido_paterno}</p>
          <p><strong>Apellido Materno:</strong> {clienteSeleccionado.apellido_materno}</p>
          <p><strong>Límite Crédito:</strong> {clienteSeleccionado.limite_credito}</p>
        </section>
      )}

      {saldoCliente && (
        <section className="saldoCliente">
          <h3>Saldo Actual</h3>
          <p><strong>Fecha:</strong> {saldoCliente.fecha || "Sin registros"}</p>
          <p><strong>Hora:</strong> {saldoCliente.hora || "Sin registros"}</p>
          <p><strong>Saldo disponible:</strong> {clienteSeleccionado.limite_credito - saldoCliente.monto_que_pagar}</p>
          <p><strong>Total de deuda:</strong> {saldoCliente.monto_que_pagar}</p>
        </section>
      )}

      {compraReciente && (
        <section className="compraReciente">
          <h3>Última Compra a Crédito</h3>
          <p><strong>Fecha:</strong> {compraReciente.fecha}</p>
          <p><strong>Hora:</strong> {compraReciente.hora}</p>
          <p><strong>Total:</strong> {compraReciente.total}</p>
        </section>
      )}


    </div>
  )
}

export default SaldoCliente