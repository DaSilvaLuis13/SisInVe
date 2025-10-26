import { useState, useEffect } from 'react';
import { supabase } from "../services/client";
import './saldoCliente.css'; // Importa el CSS propio

function SaldoCliente() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [saldoCliente, setSaldoCliente] = useState(null);
  const [compraReciente, setCompraReciente] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [idCorte, setIdCorte] = useState(null);
  const [corteActual, setCorteActual] = useState(null);

  // Obtener clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno, limite_credito")
        .order('id', { ascending: true });
      if (!error) setClientes(data);
    };
    fetchClientes();
  }, []);

  // Obtener último corte
  useEffect(() => {
    const fetchUltimoCorte = async () => {
      const { data, error } = await supabase
        .from("CorteCaja")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        setIdCorte(data.id);
        setCorteActual(data);
      }
    };
    fetchUltimoCorte();
  }, []);

  // Obtener saldo y última compra del cliente seleccionado
  useEffect(() => {
    if (!clienteSeleccionado) return;

    const fetchSaldo = async () => {
      const { data, error } = await supabase
        .from("SaldoCliente")
        .select("fecha, hora, monto_que_pagar")
        .eq("id_cliente", clienteSeleccionado.id);

      if (!error) {
        if (data.length === 0) setSaldoCliente({ fecha: null, hora: null, monto_que_pagar: 0 });
        else setSaldoCliente(data[0]);
      }
    };

    const fetchCompraReciente = async () => {
      const { data, error } = await supabase
        .from("Ventas")
        .select("fecha, hora, total")
        .eq("id_cliente", clienteSeleccionado.id)
        .eq("tipo_pago", "credito")
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false })
        .limit(1);
      if (!error) setCompraReciente(data.length ? data[0] : null);
    };

    fetchSaldo();
    fetchCompraReciente();
  }, [clienteSeleccionado]);

  const clientesFiltrados = clientes.filter(c =>
    c.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_paterno.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido_materno.toLowerCase().includes(filtro.toLowerCase())
  );

  const abonarCliente = async () => {
    if (!montoAbono || !clienteSeleccionado || !idCorte) {
      alert("Completa todos los campos necesarios.");
      return;
    }

    if (saldoCliente.monto_que_pagar <= 0) {
      alert("El cliente no tiene deuda pendiente.");
      return;
    }

    const montoFloat = parseFloat(montoAbono);
    if (montoFloat > saldoCliente.monto_que_pagar) {
      alert(`El monto a abonar no puede ser mayor a la deuda (${saldoCliente.monto_que_pagar.toFixed(2)})`);
      return;
    }

    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("es-ES", { hour12: false });

    try {
      const nuevoMonto = parseFloat((saldoCliente.monto_que_pagar - montoFloat).toFixed(2));

      // Actualizar saldo
      const { error: saldoError } = await supabase
        .from("SaldoCliente")
        .update({ monto_que_pagar: nuevoMonto, fecha, hora })
        .eq("id_cliente", clienteSeleccionado.id);
      if (saldoError) throw saldoError;

      // Actualizar corte
      const nuevosTotales = { ...corteActual };
      nuevosTotales.abonos_total = parseFloat((nuevosTotales.abonos_total + montoFloat).toFixed(2));
      nuevosTotales.fondo_actual = parseFloat((nuevosTotales.fondo_actual + montoFloat).toFixed(2));

      const { error: corteError } = await supabase
        .from("CorteCaja")
        .update({
          abonos_total: nuevosTotales.abonos_total,
          fondo_actual: nuevosTotales.fondo_actual
        })
        .eq("id", idCorte);
      if (corteError) throw corteError;

      setSaldoCliente(prev => ({ ...prev, monto_que_pagar: nuevoMonto, fecha, hora }));
      setCorteActual(nuevosTotales);
      setMontoAbono('');
      alert("Abono registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar abono:", error);
      alert("No se pudo registrar el abono.");
    }
  };

  return (
    <div className="container-saldo">
      <h2 className="title-saldo">Saldo de Clientes</h2>

      <input
        type="text"
        className="input-saldo"
        placeholder="Buscar por nombre o apellido..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className="table-responsive">
        <table>
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
            {clientesFiltrados.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nombres}</td>
                <td>{cliente.apellido_paterno}</td>
                <td>{cliente.apellido_materno}</td>
                <td className={cliente.limite_credito < 1000 ? "stock-bajo" : "stock-alto"}>
                  {cliente.limite_credito}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-select"
                    onClick={() => setClienteSeleccionado(cliente)}
                  >
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clienteSeleccionado && (
        <section className="cliente">
          <h2>{clienteSeleccionado.nombres}</h2>
          <p><strong>Apellido Paterno:</strong> {clienteSeleccionado.apellido_paterno}</p>
          <p><strong>Apellido Materno:</strong> {clienteSeleccionado.apellido_materno}</p>
          <p><strong>Límite Crédito:</strong> {clienteSeleccionado.limite_credito}</p>

          <button
            className="btn-limpiar"
            onClick={() => {
              setClienteSeleccionado(null);
              setSaldoCliente(null);
              setCompraReciente(null);
              setMontoAbono('');
            }}
          >
            Limpiar selección
          </button>
        </section>
      )}


      {saldoCliente && (
        <section className="saldoCliente">
          <h3>Saldo Actual</h3>
          <p><strong>Fecha:</strong> {saldoCliente.fecha || "Sin registros"}</p>
          <p><strong>Hora:</strong> {saldoCliente.hora || "Sin registros"}</p>
          <p><strong>Saldo disponible:</strong> {(clienteSeleccionado.limite_credito - saldoCliente.monto_que_pagar).toFixed(2)}</p>
          <p><strong>Total de deuda:</strong> {saldoCliente.monto_que_pagar.toFixed(2)}</p>

          <div className="mb-3 mt-2">
            <input
              type="number"
              placeholder="Monto a abonar"
              className="input-saldo"
              value={montoAbono}
              onChange={(e) => setMontoAbono(e.target.value)}
              disabled={saldoCliente.monto_que_pagar <= 0}
            />
            <button
              className="btn-abonar"
              onClick={abonarCliente}
              disabled={saldoCliente.monto_que_pagar <= 0 || montoAbono <= 0}
            >
              Abonar
            </button>
            {saldoCliente.monto_que_pagar <= 0 && (
              <p className="alert-saldo">El cliente no tiene deuda pendiente.</p>
            )}
          </div>
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
  );
}

export default SaldoCliente;
