// src/pages/Devoluciones.jsx
import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import { useNavigate } from "react-router-dom";
import Busqueda from "../components/Busqueda"; // Asegúrate que la ruta sea correcta

function Devoluciones() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadDevolver, setCantidadDevolver] = useState(1);
  const [tipoDevolucion, setTipoDevolucion] = useState("contado"); // 'contado' | 'credito'
  const [clienteCredito, setClienteCredito] = useState(null);
  const [corteCajaId, setCorteCajaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Carga inicial de productos y clientes
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      // Cargar productos
      const { data: dataProductos, error: errorProductos } = await supabase
        .from("Productos")
        .select("id, nombre, codigo_barras, precio_venta");
      if (errorProductos) console.error("Error cargando productos:", errorProductos);
      else setProductos(dataProductos);

      // Cargar clientes
      const { data: dataClientes, error: errorClientes } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno, limite_credito");
      if (errorClientes) console.error("Error cargando clientes:", errorClientes);
      else setClientes(dataClientes);
    };

    cargarDatosIniciales();
  }, []);

  // Función principal para registrar la devolución
  const grabarDevolucion = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!productoSeleccionado) return alert("Selecciona un producto para devolver.");
    if (!Number.isFinite(cantidadDevolver) || cantidadDevolver <= 0)
      return alert("La cantidad a devolver debe ser un número mayor a 0.");
    if (tipoDevolucion === "contado" && !corteCajaId)
      return alert("Para devolución a contado, indica el ID de corte de caja.");
    if (tipoDevolucion === "credito" && !clienteCredito)
      return alert("Para devolución a crédito, selecciona un cliente.");

    setIsSubmitting(true);
    const totalDevolver = Number(productoSeleccionado.precio_venta) * Number(cantidadDevolver);
    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toTimeString().split(" ")[0];

    try {
      // 1. Insertar en la tabla 'Devolucion'
      const { data: devolucion, error: devolucionError } = await supabase
        .from("Devolucion")
        .insert({
          // Ya no se incluye "id_venta", lo que es correcto.
          fecha,
          hora,
          dinero_devolver: totalDevolver,
          id_corte: tipoDevolucion === "contado" ? corteCajaId : null,
        })
        .select()
        .single();
      if (devolucionError) throw devolucionError;

      // 2. Insertar el detalle de la devolución
      await supabase.from("DetalleDevolucion").insert({
        id_devolucion: devolucion.id,
        id_producto: productoSeleccionado.id,
        cantidad: Number(cantidadDevolver),
        precio_unitario: productoSeleccionado.precio_venta,
        subtotal: totalDevolver,
      });
      
      // 3. Aumentar el stock del producto (RPC)
      const { error: inventarioError } = await supabase.rpc("aumentar_stock", {
        producto_id: productoSeleccionado.id,
        cantidad: Number(cantidadDevolver),
      });
      if (inventarioError) throw inventarioError;

      // 4. Registrar movimiento de inventario (entrada)
      await supabase.from("MovimientoInventario").insert({
        id_producto: productoSeleccionado.id,
        fecha,
        hora,
        tipo: "entrada",
        cantidad: Number(cantidadDevolver),
      });

      // 5. Ajuste financiero (caja o saldo de cliente)
      if (tipoDevolucion === "contado") {
        const { error: cajaError } = await supabase.rpc("modificar_saldo_caja", {
          monto_cambio: -totalDevolver, // Sale dinero de la caja
          tipo_movimiento: "Devolucion",
          id_corte: corteCajaId,
        });
        if (cajaError) throw cajaError;
        alert("Devolución a contado registrada. El saldo de la caja ha sido ajustado.");
      } else { // Devolución a crédito
        await supabase.from("SaldoCliente").insert({
          id_cliente: Number(clienteCredito.id),
          fecha,
          hora,
          monto_que_pagar: -totalDevolver, // Saldo a favor (negativo en la deuda)
          tipo_movimiento: "DevolucionCredito",
        });
        alert("Devolución registrada como saldo a favor del cliente.");
      }

      // 6. Limpiar formulario
      setProductoSeleccionado(null);
      setCantidadDevolver(1);
      setClienteCredito(null);
      setCorteCajaId("");
      
    } catch (err) {
      console.error("Error en la transacción de devolución:", err);
      alert(`Error al procesar la devolución: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalADevolver = productoSeleccionado ? (productoSeleccionado.precio_venta * cantidadDevolver).toFixed(2) : "0.00";

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Registrar Devolución de Producto</h2>
      <div className="row g-4">
        
        <div className="col-md-5">
            <div className="card">
                <div className="card-header"><h5>1. Buscar Producto</h5></div>
                <div className="card-body">
                    <Busqueda datos={productos} onSeleccionar={setProductoSeleccionado} />
                </div>
            </div>
        </div>

        <div className="col-md-7">
          {!productoSeleccionado ? (
             <div className="card text-center h-100 justify-content-center">
                <div className="card-body text-muted">
                    <p>Selecciona un producto de la lista para continuar.</p>
                </div>
             </div>
          ) : (
            <form onSubmit={grabarDevolucion}>
              <div className="card">
                <div className="card-header">
                  <h5>2. Detalles de la Devolución</h5>
                </div>
                <div className="card-body">
                  <p><strong>Producto:</strong> {productoSeleccionado.nombre}</p>
                  
                  <div className="mb-3">
                    <label className="form-label">Cantidad a devolver</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={cantidadDevolver}
                      onChange={(e) => setCantidadDevolver(Number(e.target.value))}
                    />
                  </div>

                  <h5 className="mt-4">3. Tipo de Devolución</h5>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" id="contado" value="contado" checked={tipoDevolucion === "contado"} onChange={(e) => setTipoDevolucion(e.target.value)} />
                    <label className="form-check-label" htmlFor="contado">Contado (Ajusta Caja)</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" id="credito" value="credito" checked={tipoDevolucion === "credito"} onChange={(e) => setTipoDevolucion(e.target.value)} />
                    <label className="form-check-label" htmlFor="credito">Crédito (Saldo a Favor del Cliente)</label>
                  </div>

                  {tipoDevolucion === "contado" && (
                    <div className="mt-3">
                      <label className="form-label">ID de Corte de Caja</label>
                      <input type="text" className="form-control" value={corteCajaId} onChange={(e) => setCorteCajaId(e.target.value)} required />
                    </div>
                  )}

                  {tipoDevolucion === "credito" && (
                    <div className="mt-3">
                      <label className="form-label">Selecciona el Cliente</label>
                      {clienteCredito && <p className="mb-1"><strong>Cliente:</strong> {clienteCredito.nombres} {clienteCredito.apellido_paterno}</p>}
                      <Busqueda datos={clientes} onSeleccionar={setClienteCredito} />
                    </div>
                  )}
                </div>
                <div className="card-footer bg-light">
                  <h4 className="mb-3">Total a devolver: ${totalADevolver}</h4>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                      {isSubmitting ? 'Procesando...' : 'Registrar Devolución'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/home")}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Devoluciones;
