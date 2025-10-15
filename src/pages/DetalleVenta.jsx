import { useState, useEffect } from "react";
import { supabase } from "../services/client";

function DetalleVenta() {
  const [ventas, setVentas] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  // Filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroTipoPago, setFiltroTipoPago] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Cargar ventas con datos del cliente
  useEffect(() => {
    const fetchVentas = async () => {
      let query = supabase
        .from("Ventas")
        .select(`
          id,
          id_cliente,
          fecha,
          hora,
          tipo_pago,
          total,
          cliente:Clientes (nombres, apellido_paterno, apellido_materno)
        `)
        .order("id", { ascending: true });

      if (fechaInicio) query = query.gte("fecha", fechaInicio);
      if (fechaFin) query = query.lte("fecha", fechaFin);
      if (filtroId) query = query.eq("id", filtroId);
      if (filtroTipoPago) query = query.ilike("tipo_pago", `%${filtroTipoPago}%`);

      const { data, error } = await query;
      if (error) console.error("Error al cargar ventas:", error);
      else setVentas(data);
    };

    fetchVentas();
  }, [fechaInicio, fechaFin, filtroId, filtroTipoPago]);

  // Cargar detalle de venta con productos
  useEffect(() => {
    if (!ventaSeleccionada) return;

    const fetchDetalle = async () => {
      const { data, error } = await supabase
        .from("DetalleVenta")
        .select(`
          cantidad,
          precio_unitario,
          subtotal,
          producto:Productos (codigo_barras, nombre, unidad_medida)
        `)
        .eq("id_venta", ventaSeleccionada.id);

      if (error) console.error("Error al cargar detalle:", error);
      else setDetalleVenta(data);
    };

    fetchDetalle();
  }, [ventaSeleccionada]);

  // Filtrar por cliente
  const ventasFiltradas = ventas.filter((v) => {
    if (filtroCliente && v.cliente) {
      const nombreCompleto = `${v.cliente.nombres} ${v.cliente.apellido_paterno} ${v.cliente.apellido_materno}`.toLowerCase();
      return nombreCompleto.includes(filtroCliente.toLowerCase());
    }
    return true;
  });

  return (
    <div className="container mt-4">
      <h2>Detalle de Ventas</h2>

      {/* Filtros */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="ID de venta"
          value={filtroId}
          onChange={(e) => setFiltroId(e.target.value)}
          className="form-control mb-2"
        />
        <input
          type="text"
          placeholder="Cliente (solo créditos)"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="form-control mb-2"
        />
        <select
          value={filtroTipoPago}
          onChange={(e) => setFiltroTipoPago(e.target.value)}
          className="form-control mb-2"
        >
          <option value="">Tipo de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Crédito">Crédito</option>
        </select>
        <div className="d-flex gap-2 mb-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="form-control"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>ID Cliente</th>
            <th>Nombre Cliente</th>
            <th>Fecha</th>
            <th>Tipo de Pago</th>
            <th>Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {ventasFiltradas.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.id_cliente || "-"}</td>
              <td>
                {v.cliente
                  ? `${v.cliente.nombres} ${v.cliente.apellido_paterno} ${v.cliente.apellido_materno}`
                  : "-"}
              </td>
              <td>{v.fecha}</td>
              <td>{v.tipo_pago}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setVentaSeleccionada(v)}
                >
                  Seleccionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ticket de venta */}
      {ventaSeleccionada && (
        <div className="ticket p-3 mt-4 border">
          <h4>Supermercado X</h4>
          <p>Venta #{ventaSeleccionada.id}</p>
          <p>
            Fecha: {ventaSeleccionada.fecha} Hora: {ventaSeleccionada.hora}
          </p>
          {ventaSeleccionada.cliente && (
            <p>
              Cliente:{" "}
              {`${ventaSeleccionada.cliente.nombres} ${ventaSeleccionada.cliente.apellido_paterno} ${ventaSeleccionada.cliente.apellido_materno}`}
            </p>
          )}
          <p>Tipo de Pago: {ventaSeleccionada.tipo_pago}</p>
          <hr />
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant</th>
                <th>P.Unit</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalleVenta.map((d, i) => (
                <tr key={i}>
                  <td>{d.producto?.nombre}</td>
                  <td>{d.cantidad}</td>
                  <td>{d.precio_unitario}</td>
                  <td>{d.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <p>Total: {ventaSeleccionada.total}</p>
        </div>
      )}
    </div>
  );
}

export default DetalleVenta;
