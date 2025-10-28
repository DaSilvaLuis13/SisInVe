import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import Busqueda from "../components/Busqueda";
import "./devoluciones.css";

function Devoluciones() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [tipoBusqueda, setTipoBusqueda] = useState(null);
  const [productoMedida, setProductoMedida] = useState(null);
  const [cantidadMedida, setCantidadMedida] = useState("");
  const [precioMedida, setPrecioMedida] = useState("");
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [seleccion, setSeleccion] = useState({ cliente: null });
  const [tipoDevolucion, setTipoDevolucion] = useState("contado");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saldoCliente, setSaldoCliente] = useState(0);

  // Fetch productos y clientes
  useEffect(() => {
    const fetchData = async () => {
      const { data: prodData } = await supabase
        .from("Productos")
        .select("id,nombre,codigo_barras,precio_venta,unidad_medida")
        .order("id", { ascending: true });
      setProductos(prodData || []);

      const { data: cliData } = await supabase
        .from("Clientes")
        .select("id,nombres,apellido_paterno,apellido_materno,limite_credito")
        .order("id", { ascending: true });
      setClientes(cliData || []);
    };
    fetchData();
  }, []);

  const abrirBusqueda = (tipo) => {
    setTipoBusqueda(tipo);
    setMostrarBusqueda(true);
  };

  const manejarSeleccion = async (item) => {
    if (tipoBusqueda === "producto") {
      if (item.unidad_medida === "kilos" || item.unidad_medida === "litros") {
        setProductoMedida(item);
        setCantidadMedida("");
        setPrecioMedida("");
      } else {
        const existe = productosSeleccionados.find(p => p.id === item.id);
        if (existe) {
          setProductosSeleccionados(prev =>
            prev.map(p => p.id === item.id ? { ...p, cantidad: p.cantidad + 1 } : p)
          );
        } else {
          setProductosSeleccionados(prev => [...prev, { ...item, cantidad: 1 }]);
        }
      }
    } else if (tipoBusqueda === "cliente") {
      setSeleccion({ cliente: item });
      setTipoDevolucion("credito");

      // Obtener saldo del cliente
      const { data: saldoData } = await supabase
        .from("SaldoCliente")
        .select("monto_que_pagar")
        .eq("id_cliente", item.id)
        .maybeSingle();

      setSaldoCliente(saldoData?.monto_que_pagar || 0);
    }
    setMostrarBusqueda(false);
  };

  const confirmarMedida = () => {
    const cantidad = parseFloat(cantidadMedida);
    const precio = parseFloat(precioMedida);
    if ((!isNaN(cantidad) && cantidad > 0) || (!isNaN(precio) && precio > 0)) {
      setProductosSeleccionados(prev => {
        const cantidadFinal = !isNaN(cantidad) && cantidad > 0
          ? cantidad
          : precio / productoMedida.precio_venta;

        const existeIndex = prev.findIndex(p => p.id === productoMedida.id);
        if (existeIndex >= 0) {
          const actualizado = [...prev];
          actualizado[existeIndex] = {
            ...productoMedida,
            cantidad: cantidadFinal,
            precio_venta: productoMedida.precio_venta
          };
          return actualizado;
        } else {
          return [...prev, { ...productoMedida, cantidad: cantidadFinal, precio_venta: productoMedida.precio_venta }];
        }
      });
      cerrarModalMedida();
    }
  };

  const cerrarModalMedida = () => {
    setProductoMedida(null);
    setCantidadMedida("");
    setPrecioMedida("");
  };

  const actualizarCantidad = (producto, delta) => {
    if (producto.unidad_medida === "kilos" || producto.unidad_medida === "litros") {
      setProductoMedida(producto);
      setCantidadMedida("");
      setPrecioMedida("");
    } else {
      setProductosSeleccionados(prev =>
        prev.map(p => p.id === producto.id ? { ...p, cantidad: Math.max(1, (p.cantidad || 1) + delta) } : p)
      );
    }
  };

  const quitarProducto = (id) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  const cancelarDevolucion = () => {
    setProductosSeleccionados([]);
    setSeleccion({ cliente: null });
    setTipoDevolucion("contado");
    setProductoMedida(null);
    setCantidadMedida("");
    setPrecioMedida("");
    setSaldoCliente(0);
  };

  const total = productosSeleccionados.reduce((acc, p) => acc + p.precio_venta * p.cantidad, 0);

  const generarTicketHTML = () => {
    let html = `<h3>Ticket de Devolución (${tipoDevolucion})</h3>`;
    if (seleccion.cliente) {
      html += `<p>Cliente: ${seleccion.cliente.nombres} ${seleccion.cliente.apellido_paterno} ${seleccion.cliente.apellido_materno}</p>`;
    }
    html += "<table border='1' cellspacing='0' cellpadding='5' style='width:100%'>";
    html += "<tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>";
    productosSeleccionados.forEach(p => {
      html += `<tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>${p.precio_venta.toFixed(2)}</td>
        <td>${(p.precio_venta * p.cantidad).toFixed(2)}</td>
      </tr>`;
    });
    html += `<tr><th colspan="3">Total</th><th>${total.toFixed(2)}</th></tr>`;
    html += "</table>";
    html += `<p>Fecha: ${new Date().toLocaleString()}</p>`;
    return html;
  };

  const imprimirTicket = () => {
    const ticketHTML = generarTicketHTML();
    const printWindow = window.open("", "PRINT", "height=600,width=400");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Ticket</title></head><body>");
      printWindow.document.write(ticketHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      alert("No se pudo abrir la ventana de impresión. Revisa tu bloqueador de pop-ups.");
    }
  };

  const registrarDevolucion = async () => {
    if (productosSeleccionados.length === 0) return alert("Agrega al menos un producto.");
    if (tipoDevolucion === "credito" && !seleccion.cliente) return alert("Selecciona un cliente para crédito.");

    setIsSubmitting(true);
    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toTimeString().split(" ")[0];

    try {
      // Validación de saldo del cliente
      if (tipoDevolucion === "credito" && seleccion.cliente) {
        if (saldoCliente <= 0) {
          alert("El cliente no tiene saldo pendiente. No se puede realizar la devolución.");
          setIsSubmitting(false);
          return;
        }

        if (total > saldoCliente) {
          alert(`El monto a devolver (${total.toFixed(2)}) supera el saldo pendiente del cliente (${saldoCliente.toFixed(2)}).`);
          setIsSubmitting(false);
          return;
        }
      }

      const { data: corteData } = await supabase
        .from("CorteCaja")
        .select("id,devoluciones_total")
        .eq("fecha", fecha)
        .order("id", { ascending: false })
        .limit(1);

      if (!corteData || corteData.length === 0) {
        alert("No hay un corte de caja abierto para hoy.");
        setIsSubmitting(false);
        return;
      }

      const idCorte = corteData[0].id;
      const devolucionesPrevias = corteData[0].devoluciones_total || 0;

      const insertData = {
        fecha,
        hora,
        dinero_devolver: total,
        id_corte: idCorte,
        tipo_devolucion: tipoDevolucion
      };

      if (tipoDevolucion === "credito" && seleccion.cliente) {
        insertData.id_cliente = seleccion.cliente.id;
      }

      const { data: devolucion, error } = await supabase
        .from("Devolucion")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      for (let p of productosSeleccionados) {
        await supabase.from("DetalleDevolucion").insert({
          id_devolucion: devolucion.id,
          id_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio_venta,
          subtotal: p.cantidad * p.precio_venta,
        });

        await supabase.rpc("aumentar_stock", { producto_id: p.id, cantidad: p.cantidad });
      }

      if (tipoDevolucion === "credito" && seleccion.cliente) {
        const { data: saldoData } = await supabase
          .from("SaldoCliente")
          .select("id,monto_que_pagar")
          .eq("id_cliente", seleccion.cliente.id)
          .maybeSingle();

        if (saldoData) {
          await supabase.from("SaldoCliente").update({
            monto_que_pagar: Number(saldoData.monto_que_pagar || 0) - total,
            fecha,
            hora
          }).eq("id", saldoData.id);
        }
      }

      const nuevoDevolucionesTotal = devolucionesPrevias + total;
      await supabase
        .from("CorteCaja")
        .update({ devoluciones_total: nuevoDevolucionesTotal })
        .eq("id", idCorte);

      alert("Devolución registrada correctamente.");
      cancelarDevolucion();
    } catch (err) {
      console.error("Error al registrar devolución:", err);
      alert("Ocurrió un error al procesar la devolución.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrarClick = async () => {
    const deseaTicket = window.confirm("¿Desea imprimir el ticket de la devolución?");
    if (deseaTicket) imprimirTicket();
    await registrarDevolucion();
  };

  const botonDisabled = isSubmitting ||
    (tipoDevolucion === "credito" && seleccion.cliente && (saldoCliente <= 0 || total > saldoCliente));

  return (
    <div className="devoluciones-container my-4">
      <h2 className="devoluciones-card-title text-center mb-4">Registrar Devolución</h2>

      <div className="devoluciones-card">
        <h5 className="devoluciones-card-title">Agregar productos</h5>
        <button className="btn-devoluciones-primary mb-3" onClick={() => abrirBusqueda("producto")}>
          Buscar producto
        </button>
        <div className="table-responsive">
          <table className="devoluciones-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Unidad</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">P. Unitario</th>
                <th className="text-end">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosSeleccionados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">No hay productos agregados</td>
                </tr>
              ) : productosSeleccionados.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.codigo_barras}</td>
                  <td>{p.unidad_medida}</td>
                  <td className="text-end">
                    <div className="d-flex gap-1">
                      <button className="btn-devoluciones-danger btn-sm" onClick={() => actualizarCantidad(p, -1)}>-</button>
                      <span>{p.cantidad}</span>
                      <button className="btn-devoluciones-success btn-sm" onClick={() => actualizarCantidad(p, +1)}>+</button>
                    </div>
                  </td>
                  <td className="text-end">${p.precio_venta.toFixed(2)}</td>
                  <td className="text-end">${(p.precio_venta * p.cantidad).toFixed(2)}</td>
                  <td>
                    <button className="btn-devoluciones-danger btn-sm" onClick={() => quitarProducto(p.id)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={5} className="text-end">Total</th>
                <th className="devoluciones-total">${total.toFixed(2)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {productoMedida && (
        <div className="devoluciones-modal-overlay position-fixed top-0 start-0 w-100 h-100">
          <div className="devoluciones-modal-content">
            <h5>Ingrese cantidad o precio para {productoMedida.nombre} ({productoMedida.unidad_medida})</h5>
            <input type="number" className="devoluciones-input" placeholder="Cantidad" value={cantidadMedida} onChange={e => {
              setCantidadMedida(e.target.value);
              const val = parseFloat(e.target.value);
              setPrecioMedida(!isNaN(val) ? (val * productoMedida.precio_venta).toFixed(2) : "");
            }} />
            <input type="number" className="devoluciones-input" placeholder="Precio total" value={precioMedida} onChange={e => {
              setPrecioMedida(e.target.value);
              const val = parseFloat(e.target.value);
              setCantidadMedida(!isNaN(val) ? (val / productoMedida.precio_venta).toFixed(3) : "");
            }} />
            <div className="text-end mt-3">
              <button className="btn-devoluciones-warning me-2" onClick={cerrarModalMedida}>Cancelar</button>
              <button className="btn-devoluciones-success" onClick={confirmarMedida}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      <div className="devoluciones-card d-flex align-items-center gap-3 p-3">
        <p><strong>Tipo de devolución:</strong> {tipoDevolucion || "No seleccionado"}</p>
        {tipoDevolucion === "credito" && seleccion.cliente && (
          <p><strong>Cliente:</strong> {seleccion.cliente.nombres} {seleccion.cliente.apellido_paterno} {seleccion.cliente.apellido_materno}</p>
        )}
        {tipoDevolucion === "credito" && seleccion.cliente && (
          <p><strong>Saldo pendiente:</strong> ${saldoCliente.toFixed(2)}</p>
        )}
      </div>

      <div className="devoluciones-card d-flex gap-2 flex-wrap">
        <button className="btn-devoluciones-success" onClick={() => { setTipoDevolucion("contado"); setSeleccion({ cliente: null }); setSaldoCliente(0); }}>Contado</button>
        <button className="btn-devoluciones-primary" onClick={() => abrirBusqueda("cliente")}>Crédito / Cliente</button>
        <button className="btn-devoluciones-danger" onClick={() => { setSeleccion({ cliente: null }); setTipoDevolucion(""); setSaldoCliente(0); }}>Quitar cliente</button>
        <button className="btn-devoluciones-warning" onClick={cancelarDevolucion}>Cancelar devolución</button>
        <button className="btn-devoluciones-success ms-auto" onClick={handleRegistrarClick} disabled={botonDisabled}>
          {isSubmitting ? "Procesando..." : "Registrar devolución"}
        </button>
      </div>

      {mostrarBusqueda && (
        <div className="devoluciones-modal-overlay position-fixed top-0 start-0 w-100 h-100">
          <div className="devoluciones-modal-content">
            <h5>Buscar {tipoBusqueda === "producto" ? "Producto" : "Cliente"}</h5>
            <Busqueda datos={tipoBusqueda === "producto" ? productos : clientes} onSeleccionar={manejarSeleccion} />
            <div className="text-end mt-3">
              <button className="btn-devoluciones-warning" onClick={() => setMostrarBusqueda(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devoluciones;
