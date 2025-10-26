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

  const manejarSeleccion = (item) => {
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
  };

  const total = productosSeleccionados.reduce((acc, p) => acc + p.precio_venta * p.cantidad, 0);

  const registrarDevolucion = async () => {
    if (productosSeleccionados.length === 0) return alert("Agrega al menos un producto.");
    if (tipoDevolucion === "credito" && !seleccion.cliente) return alert("Selecciona un cliente para crédito.");

    setIsSubmitting(true);
    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toTimeString().split(" ")[0];

    try {
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
        } else {
          await supabase.from("SaldoCliente").insert({
            id_cliente: seleccion.cliente.id,
            monto_que_pagar: -total,
            fecha,
            hora
          });
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

  return (
    <div className="devoluciones-container container my-4">
      <h2 className="text-center mb-4">Registrar Devolución</h2>

      {/* Tabla de productos */}
      <div className="card shadow-sm mb-4 devoluciones-table">
        <div className="card-body">
          <h5>Agregar productos</h5>
          <button className="btn btn-outline-primary mb-3" onClick={() => abrirBusqueda("producto")}>
            Buscar producto
          </button>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
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
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => actualizarCantidad(p, -1)}>-</button>
                        <span>{p.cantidad}</span>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => actualizarCantidad(p, +1)}>+</button>
                      </div>
                    </td>
                    <td className="text-end">${p.precio_venta.toFixed(2)}</td>
                    <td className="text-end">${(p.precio_venta * p.cantidad).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => quitarProducto(p.id)}>Quitar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={5} className="text-end">Total</th>
                  <th className="text-end">${total.toFixed(2)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Modal kilos/litros */}
      {productoMedida && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
          <div className="modal-content p-4 rounded shadow w-50">
            <h5>Ingrese cantidad o precio para {productoMedida.nombre} ({productoMedida.unidad_medida})</h5>
            <input type="number" className="form-control my-2" placeholder="Cantidad" value={cantidadMedida} onChange={e => {
              setCantidadMedida(e.target.value);
              const val = parseFloat(e.target.value);
              setPrecioMedida(!isNaN(val) ? (val * productoMedida.precio_venta).toFixed(2) : "");
            }} />
            <input type="number" className="form-control my-2" placeholder="Precio total" value={precioMedida} onChange={e => {
              setPrecioMedida(e.target.value);
              const val = parseFloat(e.target.value);
              setCantidadMedida(!isNaN(val) ? (val / productoMedida.precio_venta).toFixed(3) : "");
            }} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary me-2" onClick={cerrarModalMedida}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarMedida}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Campos extra */}
      <div className="card shadow-sm mb-4 d-flex align-items-center gap-3 p-3">
        <p><strong>Tipo de devolución:</strong> {tipoDevolucion || "No seleccionado"}</p>
        {tipoDevolucion === "credito" && seleccion.cliente && (
          <p><strong>Cliente:</strong> {seleccion.cliente.nombres} {seleccion.cliente.apellido_paterno} {seleccion.cliente.apellido_materno}</p>
        )}
      </div>

      {/* Botones */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex gap-2 flex-wrap">
          <button className="btn btn-success" onClick={() => { setTipoDevolucion("contado"); setSeleccion({ cliente: null }); }}>Contado</button>
          <button className="btn btn-primary" onClick={() => abrirBusqueda("cliente")}>Crédito / Cliente</button>
          <button className="btn btn-danger" onClick={() => { setSeleccion({ cliente: null }); setTipoDevolucion(""); }}>Quitar cliente</button>
          <button className="btn btn-warning" onClick={cancelarDevolucion}>Cancelar devolución</button>
          <button className="btn btn-outline-success ms-auto" onClick={registrarDevolucion} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Registrar devolución"}
          </button>
        </div>
      </div>

      {/* Modal búsqueda */}
      {mostrarBusqueda && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center">
          <div className="bg-white p-4 rounded shadow w-75">
            <h5>Buscar {tipoBusqueda === "producto" ? "Producto" : "Cliente"}</h5>
            <Busqueda datos={tipoBusqueda === "producto" ? productos : clientes} onSeleccionar={manejarSeleccion} />
            <div className="text-end mt-3">
              <button className="btn btn-secondary" onClick={() => setMostrarBusqueda(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Devoluciones;
