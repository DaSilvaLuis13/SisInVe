// Imports necesarios
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, createSearchParams } from "react-router-dom";
import { supabase } from "../services/client";

/* 
Formulario de detalles de venta
Mostrar productos de la venta, subtotal por producto
*/

// Helpers
const mxn = (n) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(+n||0);
const U_LABEL = (u="") => ({KG:"kilogramos",G:"gramos",L:"litros",ML:"mililitros"}[String(u).toUpperCase()]||u||"unidades");

export default function DetalleVenta() {
  const navigate = useNavigate();
  const [qs] = useSearchParams();
  const ventaId = Number(qs.get("id"));
  const invalidId = !Number.isFinite(ventaId) || ventaId <= 0;

  // Estado compacto
  const [data, setData] = useState({
    venta:null, cliente:null, corte:null, detalles:[], productosById:{}
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [idManual, setIdManual] = useState("");

  // Carga de datos 
  useEffect(() => {
    let off = false;

    const reset = () => setData({ venta:null, cliente:null, corte:null, detalles:[], productosById:{} });

    (async () => {
      setLoading(true); setErr("");
      try {
        if (invalidId) { reset(); return; }

        // Venta
        const { data:v, error:eV } = await supabase
          .from("Ventas")
          .select("id,id_cliente,fecha,hora,tipo_pago,total,id_corte")
          .eq("id", ventaId).single();
        if (eV) throw eV;
        if (off) return;

        // Cliente / Corte (si aplican) + Detalles en paralelo
        const qCliente = v?.id_cliente
          ? supabase.from("Clientes")
              .select("id,nombres,apellido_paterno,apellido_materno,telefono,domicilio")
              .eq("id", Number(v.id_cliente)).single()
          : null;
        const qCorte = v?.id_corte
          ? supabase.from("CorteCaja")
              .select("id,fecha,hora_inicio,hora_fin,fondo_inicial")
              .eq("id", Number(v.id_corte)).single()
          : null;
        const qDet = supabase.from("DetalleVenta")
              .select("id,id_producto,cantidad,precio_unitario,subtotal")
              .eq("id_venta", ventaId).order("id",{ascending:true});

        const [clienteRes, corteRes, detRes] = await Promise.all([
          qCliente, qCorte, qDet
        ].map(p => p?.then?.(r=>r) ?? { data:null, error:null }));

        if (detRes.error) throw detRes.error;

        const detalles = detRes.data || [];
        const idsProd = [...new Set(detalles.map(d => +d.id_producto).filter(Number.isFinite))];

        let productosById = {};
        if (idsProd.length) {
          const { data:prods, error:eP } = await supabase
            .from("Productos")
            .select("id,codigo_barras,nombre,unidad_medida,precio_venta")
            .in("id", idsProd);
          if (eP) throw eP;
          prods?.forEach(p => productosById[p.id] = p);
        }

        if (!off) {
          setData({
            venta: v,
            cliente: clienteRes?.error ? null : (clienteRes?.data ?? null),
            corte:   corteRes?.error   ? null : (corteRes?.data ?? null),
            detalles,
            productosById
          });
        }
      } catch (e) {
        if (!off) setErr(e?.message || "No se pudo cargar la venta.");
      } finally {
        if (!off) setLoading(false);
      }
    })();

    return () => { off = true; };
  }, [ventaId, invalidId]);

  const nombreCompleto = (c) => [c?.nombres,c?.apellido_paterno,c?.apellido_materno].filter(Boolean).join(" ").trim();
  const totalCalc = useMemo(() =>
    data.detalles.reduce((a,d)=>a+(+d.cantidad||0)*(+d.precio_unitario||0),0), [data.detalles]);
  const mismatch = data.venta && Math.abs((+data.venta.total||0) - totalCalc) > 0.009;

  const exportCSV = () => {
    const rows = [
      ["Producto","Código barras","Unidad","Cantidad","Precio Unitario","Subtotal"],
      ...data.detalles.map(d=>{
        const p = data.productosById[d.id_producto] || {};
        return [p.nombre||d.id_producto, p.codigo_barras||"", U_LABEL(p.unidad_medida),
                d.cantidad, d.precio_unitario, d.subtotal];
      })
    ];
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download = `venta_${ventaId}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const iniciarDevolucion = () => navigate(`/devoluciones/nueva?ventaId=${ventaId}`);

  // UI: capturador si no hay ID
  if (invalidId) {
    const onSubmitId = (e) => {
      e.preventDefault();
      const n = Number(idManual);
      if (Number.isFinite(n) && n > 0) {
        navigate({ pathname:"/detalle-venta", search:createSearchParams({ id:String(n) }).toString() }, { replace:true });
      }
    };
    return (
      <div className="container my-4">
        <div className="alert alert-warning">No se recibió un ID de venta. Ingresa el ID para consultar el detalle.</div>
        <form className="card p-3" style={{maxWidth:420}} onSubmit={onSubmitId}>
          <label className="form-label">ID de venta</label>
          <div className="input-group">
            <input type="number" min={1} className="form-control" value={idManual}
              onChange={(e)=>setIdManual(e.target.value)} placeholder="Ej. 123" required/>
            <button className="btn btn-primary" type="submit">Ver detalle</button>
          </div>
          <button type="button" className="btn btn-secondary mt-3" onClick={()=>navigate(-1)}>Volver</button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container my-4">
        <div className="card p-4">
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-8"></span>
          </div>
          <div className="mt-3">Cargando detalle de la venta…</div>
        </div>
      </div>
    );
  }

  if (err || !data.venta) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger">{err || "No se encontró la venta solicitada."}</div>
        <button className="btn btn-secondary" onClick={()=>navigate(-1)}>Volver</button>
      </div>
    );
  }

  const { venta, cliente, corte, detalles, productosById } = data;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary m-0">Detalle de Venta #{venta.id}</h3>
        <div className="d-flex gap-2">
          <span className={`badge ${venta.tipo_pago==="CREDITO"?"bg-info":"bg-success"}`}>{venta.tipo_pago}</span>
          <button className="btn btn-outline-dark btn-sm" onClick={()=>window.print()}>Imprimir</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={exportCSV}>Exportar CSV</button>
          <button className="btn btn-warning btn-sm" onClick={iniciarDevolucion}>Iniciar Devolución</button>
        </div>
      </div>

      {/* Encabezado */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Venta</h5>
              <div className="row">
                <div className="col-6">
                  <div><strong>Fecha:</strong> {venta.fecha}</div>
                  <div><strong>Hora:</strong> {venta.hora}</div>
                  <div><strong>Total (guardado):</strong> {mxn(venta.total)}</div>
                </div>
                <div className="col-6">
                  <div><strong>ID Corte:</strong> {venta.id_corte ?? "—"}</div>
                  {corte && (
                    <>
                      <div><strong>Corte fecha:</strong> {corte.fecha}</div>
                      <div><strong>Inicio:</strong> {corte.hora_inicio} {corte.hora_fin?`• Fin: ${corte.hora_fin}`:""}</div>
                    </>
                  )}
                </div>
              </div>
              {mismatch && (
                <div className="alert alert-warning mt-3">
                  El total calculado ({mxn(totalCalc)}) no coincide con el total guardado ({mxn(venta.total)}).
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Cliente</h5>
              {cliente ? (
                <>
                  <div><strong>Nombre:</strong> {nombreCompleto(cliente)}</div>
                  <div><strong>Teléfono:</strong> {cliente.telefono || "—"}</div>
                  <div><strong>Domicilio:</strong> {cliente.domicilio || "—"}</div>
                </>
              ) : <div>— Sin cliente asociado —</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card shadow-sm mt-3">
        <div className="card-body">
          <h5 className="card-title mb-3">Productos de la venta</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{minWidth:220}}>Producto</th>
                  <th>Código</th>
                  <th>Unidad</th>
                  <th className="text-end" style={{width:120}}>Cantidad</th>
                  <th className="text-end" style={{width:140}}>P. Unitario</th>
                  <th className="text-end" style={{width:140}}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalles.length===0 ? (
                  <tr><td colSpan={6} className="text-center">No hay detalles registrados para esta venta.</td></tr>
                ) : detalles.map(d=>{
                  const p = productosById[d.id_producto] || {};
                  const sub = (+d.cantidad||0)*(+d.precio_unitario||0);
                  return (
                    <tr key={d.id}>
                      <td>{p.nombre || `Producto #${d.id_producto}`}</td>
                      <td>{p.codigo_barras || "—"}</td>
                      <td>{U_LABEL(p.unidad_medida)}</td>
                      <td className="text-end">{d.cantidad}</td>
                      <td className="text-end">{mxn(d.precio_unitario)}</td>
                      <td className="text-end">{mxn(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={5} className="text-end">Total calculado</th>
                  <th className="text-end">{mxn(totalCalc)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Acciones secundarias */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" onClick={()=>navigate(-1)}>Volver</button>
        <div className="text-muted small">
          ID Venta: {venta.id}{venta.id_corte!=null?` • Corte: ${venta.id_corte}`:" • Sin corte"}
        </div>
      </div>
    </div>
  );
}
