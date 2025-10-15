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
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno, limite_credito")
        .order('nombres', { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error);
        alert("No se pudieron cargar los clientes.");
      } else {
        setClientes(data);
      }
    };
    fetchClientes();
  }, []);

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