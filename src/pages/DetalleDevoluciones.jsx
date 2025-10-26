import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./detalleDevolucion.css"; // 👈 nuevo CSS con tu tema oscuro

function DetalleDevoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState(null);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroTipoDevolucion, setFiltroTipoDevolucion] = useState("");
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  const hoy = new Date();

  const formatearFechaSupabase = (date) => {
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  // Cargar devoluciones
  useEffect(() => {
    const fetchDevoluciones = async () => {
      let query = supabase
        .from("Devolucion")
        .select("id, fecha, hora, dinero_devolver, tipo_devolucion, id_cliente")
        .order("id", { ascending: true });

      if (fechaInicio) query = query.gte("fecha", formatearFechaSupabase(fechaInicio));
      if (fechaFin) query = query.lte("fecha", formatearFechaSupabase(fechaFin));
      if (filtroId) query = query.eq("id", filtroId);
      if (filtroTipoDevolucion) query = query.ilike("tipo_devolucion", `%${filtroTipoDevolucion}%`);

      const { data: devolucionesData, error } = await query;
      if (error) {
        console.error("Error cargando devoluciones:", error);
        return;
      }

      // Traer clientes
      const clientesIds = devolucionesData.map(d => d.id_cliente).filter(Boolean);
      const { data: clientesData } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno")
        .in("id", clientesIds);

      const devolucionesConClientes = devolucionesData.map(d => ({
        ...d,
        cliente: clientesData.find(c => c.id === d.id_cliente) || null
      }));

      setDevoluciones(devolucionesConClientes);
    };

    fetchDevoluciones();
  }, [filtroId, filtroTipoDevolucion, fechaInicio, fechaFin]);

  // Cargar detalle
  useEffect(() => {
    if (!devolucionSeleccionada) return;
    const fetchDetalle = async () => {
      const { data: detalleData, error } = await supabase
        .from("DetalleDevolucion")
        .select("id, id_devolucion, id_producto, cantidad, precio_unitario, subtotal")
        .eq("id_devolucion", devolucionSeleccionada.id);
      if (error) {
        console.error("Error cargando detalle:", error);
        return;
      }

      const productosIds = detalleData.map(d => d.id_producto).filter(Boolean);
      const { data: productosData } = await supabase
        .from("Productos")
        .select("id, nombre")
        .in("id", productosIds);

      const detalleConProductos = detalleData.map(d => ({
        ...d,
        producto: productosData.find(p => p.id === d.id_producto) || { nombre: "-" }
      }));
      setDetalle(detalleConProductos);
    };
    fetchDetalle();
  }, [devolucionSeleccionada]);

  // Filtrar por cliente
  const devolucionesFiltradas = devoluciones.filter((d) => {
    if (filtroCliente && d.cliente) {
      const nombreCompleto = `${d.cliente.nombres} ${d.cliente.apellido_paterno} ${d.cliente.apellido_materno}`.toLowerCase();
      return nombreCompleto.includes(filtroCliente.toLowerCase());
    }
    return true;
  });

  return (
  <div className="devoluciones-container py-4">
    <div className="container">
      <h2 className="devoluciones-title mb-4 text-center fw-bold">📄 Detalle de Devoluciones</h2>

      {/* Filtros */}
      <div className="card devoluciones-filtros-card shadow-sm mb-4 p-3">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              placeholder="ID devolución"
              value={filtroId}
              onChange={(e) => setFiltroId(e.target.value)}
              className="form-control devoluciones-input"
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              placeholder="Cliente"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="form-control devoluciones-input"
            />
          </div>
          <div className="col-md-3">
            <select
              value={filtroTipoDevolucion}
              onChange={(e) => setFiltroTipoDevolucion(e.target.value)}
              className="form-select devoluciones-select"
            >
              <option value="">Tipo de devolución</option>
              <option value="Contado">Contado</option>
              <option value="Credito">Crédito</option>
            </select>
          </div>
          <div className="col-md-3 d-flex gap-2">
            <DatePicker
              selected={fechaInicio}
              onChange={(date) => {
                setFechaInicio(date);
                if (fechaFin && date > fechaFin) setFechaFin(date);
              }}
              className="form-control devoluciones-datepicker"
              placeholderText="Desde"
              dateFormat="yyyy/MM/dd"
              maxDate={hoy}
            />
            <DatePicker
              selected={fechaFin}
              onChange={(date) => setFechaFin(date)}
              className="form-control devoluciones-datepicker"
              placeholderText="Hasta"
              dateFormat="yyyy/MM/dd"
              minDate={fechaInicio || null}
              maxDate={hoy}
            />
          </div>
        </div>
      </div>

      {/* Tabla de devoluciones */}
      <div className="table-responsive shadow-sm rounded devoluciones-table">
        <table className="table table-hover align-middle mb-0 devoluciones-tbl">
          <thead className="devoluciones-thead">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Total</th>
              <th>Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {devolucionesFiltradas.map((d) => (
              <tr key={d.id} className="devoluciones-row">
                <td>{d.id}</td>
                <td>{d.cliente ? `${d.cliente.nombres} ${d.cliente.apellido_paterno}` : "-"}</td>
                <td>{d.fecha}</td>
                <td>{d.tipo_devolucion}</td>
                <td>{d.dinero_devolver}</td>
                <td>
                  <button
                    className=" btn-sm devoluciones-btn-primary"
                    onClick={() => setDevolucionSeleccionada(d)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ticket de la devolución */}
      {devolucionSeleccionada && (
        <div className="devoluciones-ticket-card mt-4 p-3 rounded shadow-sm bg-light">
          <h5 className="fw-bold">🧾 Supermercado X</h5>
          <p>Devolución #{devolucionSeleccionada.id}</p>
          <p>Fecha: {devolucionSeleccionada.fecha} | Hora: {devolucionSeleccionada.hora}</p>
          {devolucionSeleccionada.cliente && (
            <p>Cliente: {`${devolucionSeleccionada.cliente.nombres} ${devolucionSeleccionada.cliente.apellido_paterno}`}</p>
          )}
          <p>Tipo: {devolucionSeleccionada.tipo_devolucion}</p>
          <hr />
          <table className="table table-sm devoluciones-ticket-table text-dark">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant</th>
                <th>P.Unit</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, i) => (
                <tr key={i}>
                  <td>{d.producto.nombre}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.precio_unitario}</td>
                  <td>{d.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <h6 className="text-end fw-bold">
            Total a devolver: ${devolucionSeleccionada.dinero_devolver}
          </h6>
        </div>
      )}
    </div>
  </div>
);

}

export default DetalleDevoluciones;
