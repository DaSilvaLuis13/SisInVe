import { useState, useEffect } from "react";
import Busqueda from "../components/Busqueda";
import { supabase } from "../services/client";
import "./ventas.css";

function Venta() {
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [tipoBusqueda, setTipoBusqueda] = useState(null);
  const [seleccion, setSeleccion] = useState({ cliente: null });
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  const [productoMedida, setProductoMedida] = useState(null);
  const [cantidadMedida, setCantidadMedida] = useState("");
  const [precioMedida, setPrecioMedida] = useState("");
  const [tipoPago, setTipoPago] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("Productos")
        .select("id, codigo_barras, nombre, unidad_medida, precio_venta, stock_actual, stock_minimo")
        .order("id", { ascending: true });
      if (!error) setProductos(data);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("Clientes")
        .select("id, nombres, apellido_paterno, apellido_materno, limite_credito")
        .order("id", { ascending: true });
      if (!error) setClientes(data);
    };
    fetchClientes();
  }, []);

  const abrirBusqueda = (tipo) => {
    setTipoBusqueda(tipo);
    setMostrarBusqueda(true);
  };

  const manejarSeleccion = async (item) => {
    if (tipoBusqueda === "producto") {
      // Traer stock_actual y stock_minimo
      const { data: productoData, error } = await supabase
        .from("Productos")
        .select("id, nombre, unidad_medida, precio_venta, stock_actual, stock_minimo")
        .eq("id", item.id)
        .single();

      if (error || !productoData) {
        alert("Error al obtener información del producto.");
        return;
      }

      if (productoData.stock_actual <= 0) {
        alert(
          `⚠️ El producto "${productoData.nombre}" no tiene stock disponible.\nRedirigiendo a Movimientos de Inventario.`
        );
        window.location.href = "/movimiento-inventario";
        return;
      }

      if (productoData.stock_actual <= productoData.stock_minimo) {
        alert(
          `⚠️ El producto "${productoData.nombre}" tiene un stock bajo (${productoData.stock_actual}).\nRecomendación: reponer pronto.`
        );
      }

      if (productoData.unidad_medida === "kilos" || productoData.unidad_medida === "litros") {
        setProductoMedida(productoData);
        setCantidadMedida("");
        setPrecioMedida("");
      } else {
        const existenteIndex = productosSeleccionados.findIndex((p) => p.id === productoData.id);
        if (existenteIndex >= 0) {
          setProductosSeleccionados((prev) => {
            const actualizado = [...prev];
            actualizado[existenteIndex] = {
              ...actualizado[existenteIndex],
              cantidad: (actualizado[existenteIndex].cantidad || 1) + 1,
            };
            return actualizado;
          });
        } else {
          setProductosSeleccionados((prev) => [...prev, { ...productoData, cantidad: 1 }]);
        }
      }
    } else if (tipoBusqueda === "cliente") {
      setSeleccion((prev) => ({ ...prev, cliente: item }));
      setTipoPago("Crédito");
    }
    setMostrarBusqueda(false);
  };

  const confirmarMedida = () => {
    const cantidad = parseFloat(cantidadMedida);
    const precio = parseFloat(precioMedida);
    if ((!isNaN(cantidad) && cantidad > 0) || (!isNaN(precio) && precio > 0)) {
      setProductosSeleccionados((prev) => {
        const cantidadFinal = !isNaN(cantidad) && cantidad > 0 ? cantidad : precio / productoMedida.precio_venta;
        const existenteIndex = prev.findIndex((p) => p.id === productoMedida.id);

        if (existenteIndex >= 0) {
          const actualizado = [...prev];
          actualizado[existenteIndex] = {
            ...productoMedida,
            cantidad: cantidadFinal,
            precio_venta: productoMedida.precio_venta,
          };
          return actualizado;
        } else {
          return [...prev, { ...productoMedida, cantidad: cantidadFinal, precio_venta: productoMedida.precio_venta }];
        }
      });
      cerrarModalMedida();
    }
  };

  const cancelarVenta = () => {
    setSeleccion({ cliente: null });
    setProductosSeleccionados([]);
    setProductoMedida(null);
    setCantidadMedida("");
    setPrecioMedida("");
    setTipoPago("");
  };

  const cerrarModalMedida = () => {
    setProductoMedida(null);
    setCantidadMedida("");
    setPrecioMedida("");
  };

  const onChangeCantidad = (val) => {
    setCantidadMedida(val);
    const cantidad = parseFloat(val);
    if (!isNaN(cantidad)) setPrecioMedida((cantidad * productoMedida.precio_venta).toFixed(2));
    else setPrecioMedida("");
  };

  const onChangePrecio = (val) => {
    setPrecioMedida(val);
    const precio = parseFloat(val);
    if (!isNaN(precio)) setCantidadMedida((precio / productoMedida.precio_venta).toFixed(3));
    else setCantidadMedida("");
  };

  const actualizarCantidad = (producto, delta) => {
    if (producto.unidad_medida === "kilos" || producto.unidad_medida === "litros") {
      setProductoMedida(producto);
      setCantidadMedida("");
      setPrecioMedida("");
    } else {
      setProductosSeleccionados((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: Math.max(1, (p.cantidad || 1) + delta) } : p
        )
      );
    }
  };

  const quitarProducto = (id) => {
    setProductosSeleccionados((prev) => prev.filter((p) => p.id !== id));
  };

  const total = productosSeleccionados.reduce((acc, p) => acc + p.precio_venta * p.cantidad, 0);

  const generarTicketHTML = () => {
    let html = `<h3>Ticket de ${tipoPago}</h3>`;
    if (seleccion.cliente) {
      html += `<p>Cliente: ${seleccion.cliente.nombres} ${seleccion.cliente.apellido_paterno} ${seleccion.cliente.apellido_materno}</p>`;
    }
    html += "<table border='1' cellspacing='0' cellpadding='5' style='width:100%'>";
    html += "<tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>";
    productosSeleccionados.forEach((p) => {
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

  const handleCobrarClick = async () => {
    if (productosSeleccionados.length === 0) {
      alert("Debes agregar productos");
      return;
    }
    if (!tipoPago) {
      alert("Debes seleccionar un tipo de pago");
      return;
    }
    if (tipoPago === "Crédito" && !seleccion.cliente) {
      alert("Debes seleccionar un cliente para crédito");
      return;
    }

    const deseaTicket = window.confirm("¿Desea imprimir el ticket antes de cobrar?");
    if (deseaTicket) imprimirTicket();

    await cobrarVenta();
  };

  const cobrarVenta = async () => {
    try {
      // Validación de stock antes de cobrar
      for (let p of productosSeleccionados) {
        const { data: prod } = await supabase
          .from("Productos")
          .select("nombre, stock_actual, stock_minimo")
          .eq("id", p.id)
          .single();

        if (prod) {
          if (prod.stock_actual <= 0) {
            alert(`🚫 El producto "${prod.nombre}" no tiene stock disponible. No se puede procesar la venta.`);
            window.location.href = "/movimiento-inventario";
            return;
          }

          if (prod.stock_actual <= prod.stock_minimo) {
            alert(`⚠️ El producto "${prod.nombre}" está por debajo del stock mínimo (${prod.stock_actual}).`);
          }

          if (prod.stock_actual < p.cantidad) {
            alert(
              `🚫 No hay suficiente stock de "${prod.nombre}". Disponible: ${prod.stock_actual}, solicitado: ${p.cantidad}.`
            );
            return;
          }
        }
      }

      const ahora = new Date();
      const fechaSQL = ahora.toISOString().split("T")[0];
      const horaSQL = ahora.toTimeString().split(" ")[0];

      const { data: corteData } = await supabase
        .from("CorteCaja")
        .select("id, ventas_total, fiado_total")
        .eq("fecha", fechaSQL)
        .order("id", { ascending: false })
        .limit(1);

      if (!corteData || corteData.length === 0) {
        alert("No hay un corte de caja abierto para hoy.");
        return;
      }

      const idCorte = corteData[0].id;

      const { data: ventaData } = await supabase
        .from("Ventas")
        .insert({
          id_cliente: seleccion.cliente ? seleccion.cliente.id : null,
          id_corte: idCorte,
          tipo_pago: tipoPago,
          total: total,
          fecha: fechaSQL,
          hora: horaSQL,
        })
        .select("id")
        .single();

      const idVenta = ventaData.id;

      const detalles = productosSeleccionados.map((p) => ({
        id_venta: idVenta,
        id_producto: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_venta,
        subtotal: p.cantidad * p.precio_venta,
      }));

      await supabase.from("DetalleVenta").insert(detalles);

      // Movimientos inventario
      const movimientos = productosSeleccionados.map((p) => ({
        id_producto: p.id,
        fecha: fechaSQL,
        hora: horaSQL,
        tipo: "salida",
        cantidad: p.cantidad,
      }));
      await supabase.from("MovimientosInventario").insert(movimientos);

      // Actualizar stock
      for (let p of productosSeleccionados) {
        const { data: productoActual } = await supabase
          .from("Productos")
          .select("stock_actual")
          .eq("id", p.id)
          .single();

        if (productoActual && productoActual.stock_actual !== null) {
          const nuevoStock = productoActual.stock_actual - p.cantidad;
          await supabase.from("Productos").update({ stock_actual: nuevoStock }).eq("id", p.id);
        }
      }

      // Actualizar saldo cliente
      if (tipoPago === "Crédito" && seleccion.cliente) {
        const { data: saldoData } = await supabase
          .from("SaldoCliente")
          .select("id, monto_que_pagar")
          .eq("id_cliente", seleccion.cliente.id)
          .maybeSingle();

        if (saldoData) {
          await supabase.from("SaldoCliente").update({
            monto_que_pagar: Number(saldoData.monto_que_pagar || 0) + total,
            fecha: fechaSQL,
            hora: horaSQL,
          }).eq("id", saldoData.id);
        } else {
          await supabase.from("SaldoCliente").insert({
            id_cliente: seleccion.cliente.id,
            monto_que_pagar: total,
            fecha: fechaSQL,
            hora: horaSQL,
          });
        }
      }

      // Actualizar corte de caja
      let nuevoVentasTotal = corteData[0].ventas_total || 0;
      let nuevoFiadoTotal = corteData[0].fiado_total || 0;
      if (tipoPago === "Crédito") nuevoFiadoTotal += total;
      else nuevoVentasTotal += total;

      await supabase.from("CorteCaja").update({
        ventas_total: nuevoVentasTotal,
        fiado_total: nuevoFiadoTotal,
      }).eq("id", idCorte);

      cancelarVenta();
      alert("Venta registrada correctamente.");
    } catch (error) {
      console.error("Error al cobrar la venta:", error);
      alert("Ocurrió un error al procesar la venta.");
    }
  };

  return (
    <div className="ventas-container my-4">
      <h2 className="text-center mb-4">Registrar Venta</h2>
      <div className="ventas-card">
        <h5 className="ventas-card-title">Agregar productos</h5>
        <button className="btn-ventas-primary mb-3" onClick={() => abrirBusqueda("producto")}>
          Buscar producto
        </button>
        <div className="table-responsive">
          <table className="ventas-table table table-hover align-middle">
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
                  <td colSpan={7} className="text-center">
                    No hay productos agregados
                  </td>
                </tr>
              ) : (
                productosSeleccionados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.codigo_barras}</td>
                    <td>{p.unidad_medida}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn-ventas-danger btn-sm" onClick={() => actualizarCantidad(p, -1)}>
                          -
                        </button>
                        <span>{p.cantidad}</span>
                        <button className="btn-ventas-success btn-sm" onClick={() => actualizarCantidad(p, +1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-end">${p.precio_venta.toFixed(2)}</td>
                    <td className="text-end">${(p.precio_venta * p.cantidad).toFixed(2)}</td>
                    <td>
                      <button className="btn-ventas-danger btn-sm" onClick={() => quitarProducto(p.id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={5} className="text-end">
                  Total
                </th>
                <th className="ventas-total">${total.toFixed(2)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal cantidad/precio */}
      {productoMedida && (
        <div className="ventas-modal-overlay position-fixed top-0 start-0 w-100 h-100">
          <div className="ventas-modal-content">
            <h5>
              Ingrese cantidad o precio para {productoMedida.nombre} ({productoMedida.unidad_medida})
            </h5>
            <input
              type="number"
              className="ventas-input"
              value={cantidadMedida}
              onChange={(e) => onChangeCantidad(e.target.value)}
              placeholder="Cantidad (kg/litro)"
            />
            <input
              type="number"
              className="ventas-input"
              value={precioMedida}
              onChange={(e) => onChangePrecio(e.target.value)}
              placeholder="Precio total"
            />
            <div className="text-end mt-3">
              <button className="btn-ventas-danger me-2" onClick={cerrarModalMedida}>
                Cancelar
              </button>
              <button className="btn-ventas-success" onClick={confirmarMedida}>
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ventas-card d-flex gap-3">
        <p>
          <strong>Tipo de pago:</strong> <span>{tipoPago || "No seleccionado"}</span>
        </p>
        {tipoPago === "Crédito" && seleccion.cliente && (
          <p className="ms-3">
            <strong>Cliente:</strong> {seleccion.cliente.nombres} {seleccion.cliente.apellido_paterno}{" "}
            {seleccion.cliente.apellido_materno}
          </p>
        )}
      </div>

      <div className="ventas-card d-flex gap-3">
        <button
          className="btn-ventas-success"
          onClick={() => {
            setTipoPago("Contado");
            setSeleccion({ ...seleccion, cliente: null });
          }}
        >
          Contado
        </button>
        <button className="btn-ventas-primary" onClick={() => abrirBusqueda("cliente")}>
          Crédito
        </button>
        <button
          className="btn-ventas-danger"
          onClick={() => {
            setSeleccion((prev) => ({ ...prev, cliente: null }));
            setTipoPago("");
          }}
        >
          Quitar cliente
        </button>
        <button className="btn-ventas-warning" onClick={cancelarVenta}>
          Cancelar venta
        </button>
        <button className="btn-ventas-success ms-5" onClick={handleCobrarClick}>
          Cobrar
        </button>
      </div>

      {mostrarBusqueda && (
        <div className="ventas-modal-overlay position-fixed top-0 start-0 w-100 h-100">
          <div className="ventas-modal-content w-75">
            <h5>Buscar {tipoBusqueda === "producto" ? "Producto" : "Cliente"}</h5>
            <Busqueda datos={tipoBusqueda === "producto" ? productos : clientes} onSeleccionar={manejarSeleccion} />
            <div className="text-end mt-3">
              <button className="btn-ventas-danger" onClick={() => setMostrarBusqueda(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Venta;
