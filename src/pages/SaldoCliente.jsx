<<<<<<< HEAD
// src/pages/SaldoCliente.jsx

// Aquí se importa el componente de búsqueda reutilizable
import Busqueda from '../components/Busqueda'; 
import { useState, useEffect } from 'react';
import { supabase } from "../services/client";
import { useNavigate } from 'react-router-dom';

function SaldoCliente() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [compraReciente, setCompraReciente] = useState(null);
  const navigate = useNavigate();

  // --- Estados para el formulario de pago ---
  const [monto, setMonto] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("Abono"); // 'Abono' o 'Cargo'
  const [corteCajaId, setCorteCajaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Carga la lista completa de clientes al iniciar
=======
import { useState, useEffect } from 'react'
import { supabase } from "../services/client"

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
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno, limite_credito")
<<<<<<< HEAD
        .order('nombres', { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error);
        alert("No se pudieron cargar los clientes.");
      } else {
        setClientes(data);
      }
=======
        .order('id', { ascending: true });

      if (error) console.error("Error al cargar clientes:", error);
      else setClientes(data);
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
    };
    fetchClientes();
  }, []);

<<<<<<< HEAD
  // 2. Función para obtener toda la información de un cliente seleccionado
  const refrescarDatosCliente = async (cliente) => {
    if (!cliente) return;

    // A. Calcular la deuda total sumando todos sus movimientos
    const { data: saldos, error: errorSaldo } = await supabase
      .from("SaldoCliente")
      .select("monto_que_pagar")
      .eq("id_cliente", cliente.id);

    if (errorSaldo) {
      console.error("Error al cargar saldo:", errorSaldo);
    } else {
      const total = saldos.reduce((acc, item) => acc + item.monto_que_pagar, 0);
      setDeudaTotal(total);
    }

    // B. Obtener la última compra a crédito
    const { data: venta, error: errorVenta } = await supabase
      .from("Ventas")
      .select("fecha, hora, total")
      .eq("id_cliente", cliente.id)
      .eq("tipo_pago", "credito")
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false })
      .limit(1)
      .single(); // .single() es más eficiente si solo esperas un resultado

    if (errorVenta && errorVenta.code !== 'PGRST116') { // Ignora el error "no rows found"
       console.error("Error al cargar compra reciente:", errorVenta);
    } else {
       setCompraReciente(venta);
    }
  };
  
  // 3. Llama a la función de refresco cuando cambia el cliente seleccionado
  useEffect(() => {
    refrescarDatosCliente(clienteSeleccionado);
  }, [clienteSeleccionado]);

  // 4. Función para manejar el registro de un pago o un nuevo cargo
  const handleRegistroSaldo = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return alert("El monto debe ser un número positivo.");
    }
    if (tipoMovimiento === 'Abono' && !corteCajaId) {
      return alert("Para registrar un abono, se requiere el ID del corte de caja.");
    }

    setIsSubmitting(true);

    try {
      // Si es un abono, el monto es negativo (reduce la deuda)
      // Si es un cargo, el monto es positivo (aumenta la deuda)
      const montoFinal = tipoMovimiento === 'Abono' ? -montoNum : montoNum;

      const payload = {
        id_cliente: clienteSeleccionado.id,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().split(" ")[0],
        monto_que_pagar: montoFinal,
        id_corte: tipoMovimiento === 'Abono' ? corteCajaId : null,
        tipo_movimiento: tipoMovimiento
      };

      const { error: insertError } = await supabase.from("SaldoCliente").insert([payload]);
      if (insertError) throw insertError;
      
      // Si fue un abono, también se ajusta el saldo de la caja
      if (tipoMovimiento === 'Abono') {
        const { error: rpcError } = await supabase.rpc('modificar_saldo_caja', {
            monto_cambio: montoNum, // El dinero entra a caja
            tipo_movimiento: 'Abono Cliente',
            id_corte: corteCajaId
        });
        if (rpcError) throw rpcError;
      }
      
      alert(`¡${tipoMovimiento} registrado exitosamente!`);
      
      // Limpiar formulario y refrescar datos
      setMonto("");
      setCorteCajaId("");
      await refrescarDatosCliente(clienteSeleccionado);

    } catch (error) {
      console.error(`Error al registrar ${tipoMovimiento}:`, error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const creditoDisponible = clienteSeleccionado ? clienteSeleccionado.limite_credito - deudaTotal : 0;

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Gestión de Saldos de Clientes</h2>
      <div className="row">
        
        {/* Columna de Búsqueda de Cliente */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header">
              <h5>Buscar Cliente</h5>
            </div>
            <div className="card-body">
              <Busqueda 
                datos={clientes}
                onSeleccionar={(cliente) => setClienteSeleccionado(cliente)}
              />
            </div>
          </div>
        </div>

        {/* Columna de Detalles y Formulario */}
        <div className="col-lg-7">
          {!clienteSeleccionado ? (
            <div className="card text-center">
              <div className="card-body">
                <p className="card-text text-muted">Selecciona un cliente de la lista para ver su estado de cuenta y registrar pagos.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Card de Información del Cliente */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5>Estado de Cuenta: {clienteSeleccionado.nombres} {clienteSeleccionado.apellido_paterno}</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Límite de Crédito:</strong> ${clienteSeleccionado.limite_credito?.toFixed(2)}</p>
                      <p className="text-danger"><strong>Deuda Total:</strong> ${deudaTotal.toFixed(2)}</p>
                      <p className="text-success"><strong>Crédito Disponible:</strong> ${creditoDisponible.toFixed(2)}</p>
                    </div>
                    <div className="col-md-6">
                      {compraReciente ? (
                        <>
                          <p className="mb-1"><strong>Última Compra a Crédito:</strong></p>
                          <small className="text-muted">
                            Fecha: {compraReciente.fecha} <br/>
                            Total: ${compraReciente.total?.toFixed(2)}
                          </small>
                        </>
                      ) : <p>Sin compras a crédito registradas.</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card del Formulario de Registro */}
              <div className="card">
                <div className="card-header">
                  <h5>Registrar Movimiento</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleRegistroSaldo}>
                    <div className="mb-3">
                      <label htmlFor="tipoMovimiento" className="form-label">Tipo de Movimiento</label>
                      <select id="tipoMovimiento" className="form-select" value={tipoMovimiento} onChange={e => setTipoMovimiento(e.target.value)}>
                        <option value="Abono">Abono (Pago)</option>
                        <option value="Cargo">Cargo (Aumentar deuda)</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="monto" className="form-label">Monto</label>
                      <input 
                        type="number" 
                        id="monto" 
                        className="form-control" 
                        placeholder="0.00"
                        value={monto}
                        onChange={e => setMonto(e.target.value)}
                        required 
                      />
                    </div>
                    {tipoMovimiento === 'Abono' && (
                      <div className="mb-3">
                        <label htmlFor="corteCajaId" className="form-label">ID Corte de Caja</label>
                        <input 
                          type="text" 
                          id="corteCajaId" 
                          className="form-control"
                          placeholder="ID de la sesión de caja actual" 
                          value={corteCajaId}
                          onChange={e => setCorteCajaId(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                        {isSubmitting ? 'Registrando...' : `Registrar ${tipoMovimiento}`}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/home')}>
                            Cancelar
                        </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaldoCliente;
=======
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

  // Función para abonar al saldo del cliente
  const abonarCliente = async () => {
    if (!montoAbono || !clienteSeleccionado || !idCorte) {
      alert("Completa todos los campos necesarios.");
      return;
    }

    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("es-ES", { hour12: false });
    const montoFloat = parseFloat(montoAbono);

    try {
      // Actualizar saldo existente del cliente
      const nuevoMonto = parseFloat((saldoCliente.monto_que_pagar - montoFloat).toFixed(2));

      const { error: saldoError } = await supabase
        .from("SaldoCliente")
        .update({ monto_que_pagar: nuevoMonto, fecha, hora })
        .eq("id_cliente", clienteSeleccionado.id);

      if (saldoError) throw saldoError;

      // Actualizar totales del corte
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

      // Refrescar estados locales
      setSaldoCliente(prev => ({
        ...prev,
        monto_que_pagar: nuevoMonto,
        fecha,
        hora
      }));
      setCorteActual(nuevosTotales);
      setMontoAbono('');
      alert("Abono registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar abono:", error);
      alert("No se pudo registrar el abono.");
    }
  };

  return (
    <div>SaldoCliente
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
          <p><strong>Saldo disponible:</strong> {(clienteSeleccionado.limite_credito - saldoCliente.monto_que_pagar).toFixed(2)}</p>
          <p><strong>Total de deuda:</strong> {saldoCliente.monto_que_pagar.toFixed(2)}</p>

          <div className="mb-3 mt-2">
            <input
              type="number"
              placeholder="Monto a abonar"
              className="form-control mb-2"
              value={montoAbono}
              onChange={(e) => setMontoAbono(e.target.value)}
            />
            <button className="btn btn-success" onClick={abonarCliente}>Abonar</button>
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
  )
}

export default SaldoCliente;
>>>>>>> 75d8b1eda4432544a4670708c13817aab27adcdf
