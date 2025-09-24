// src/pages/Venta.jsx
// Aquí van los import que necesites incorporar elementos de la carpeta components
import { useState, useMemo, useEffect } from "react";
import { supabase } from "../services/client";
import { useNavigate } from "react-router-dom";

/* 
Formulario de venta rápida
Selección de cliente (opcional)
Lista de productos con cantidad y precio unitario
Tipo de pago: Efectivo / Crédito
Subtotal y total automático
Asociación con CorteCaja abierto
+ Buscador por nombre/ID/código de barras
+ Escáner de código de barras para agregar directo
+ Modal de gramaje (KG/G/L/ML) según unidad_medida
*/

const mxn = (n) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(+n||0);
const nowDate = () => new Date().toISOString().slice(0,10);
const nowTime = () => new Date().toTimeString().slice(0,8);

const UMAP = {
  
  L:["L","LT","LTS","LITRO","LITROS"],
  ML:["ML","MILILITRO","MILILITROS"],
  KG:["KG","KILO","KILOS","KILOGRAMO","KILOGRAMOS"],
  G:["G","GR","GRAMO","GRAMOS"],
  UN:["PZA","PZAS","PIEZA","PIEZAS","UNIDAD","UNIDADES","U","UND"],
};
const normalize = (u="") => {
  const S = u.trim().toUpperCase();
  for (const [k,arr] of Object.entries(UMAP)) if (arr.includes(S)) return k;
  return S||"UN";
};
const U_VAR = new Set(["KG","G","L","ML"]);
const U_LABEL = (u="") => ({KG:"kilogramos",G:"gramos",L:"litros",ML:"mililitros"})[String(u).toUpperCase()] || (u||"unidades");

export default function Venta({
  clientes = [],
  catalogoProductos = [],
  corteCajaAbierto = null,
  onSubmit = async () => {},
}) {
  const navigate = useNavigate();

  // Estado
  const [clienteId, setClienteId] = useState("");
  const [tipoPago, setTipoPago] = useState("EFECTIVO");
  const [items, setItems] = useState([]);

  const [productos, setProductos] = useState(catalogoProductos);
  const [clientesState, setClientesState] = useState(clientes);

  const [cargandoProd, setCargandoProd] = useState(false);
  const [cargandoCli, setCargandoCli] = useState(false);
  const [errProd, setErrProd] = useState("");
  const [errCli, setErrCli] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errGuardar, setErrGuardar] = useState("");

  const [buscar, setBuscar] = useState("");
  const [barcode, setBarcode] = useState("");

  // Modal (fila, producto, cantidad)
  const [modal, setModal] = useState({ show:false, rowId:null, prod:null, cant:1 });

  const nombreCompleto = (c) => [c?.nombres,c?.apellido_paterno,c?.apellido_materno].filter(Boolean).join(" ").trim();

  // Carga productos
  useEffect(() => {
    let off=false;
    (async ()=>{
      setCargandoProd(true); setErrProd("");
      const { data, error } = await supabase
        .from("Productos")
        .select("id,codigo_barras,nombre,unidad_medida,precio_venta")
        .order("nombre",{ascending:true});
      if (off) return;
      if (error) { setErrProd("No se pudieron cargar los productos."); setProductos(catalogoProductos); }
      else setProductos(Array.isArray(data)&&data.length?data:catalogoProductos);
      setCargandoProd(false);
    })();
    return ()=>{off=true};
  },[]);

  // Carga clientes
  useEffect(() => {
    let off=false;
    (async ()=>{
      setCargandoCli(true); setErrCli("");
      const { data, error } = await supabase
        .from("Clientes")
        .select("id,nombres,apellido_paterno,apellido_materno")
        .order("nombres",{ascending:true});
      if (off) return;
      if (error) { setErrCli("No se pudieron cargar los clientes."); setClientesState(clientes); }
      else setClientesState(Array.isArray(data)&&data.length?data:clientes);
      setCargandoCli(false);
    })();
    return ()=>{off=true};
  },[]);

  const clientesOpciones = useMemo(()=>{
    const map = new Map();
    [...(clientes||[]),...(clientesState||[])].forEach(c=>{ if(c?.id!=null) map.set(String(c.id),c); });
    return [...map.values()];
  },[clientes,clientesState]);

  const productosFiltrados = useMemo(()=>{
    const t = buscar.trim().toLowerCase();
    if(!t) return productos;
    return productos.filter(p=>{
      const id=String(p.id).toLowerCase(), nom=(p.nombre||"").toLowerCase(), bar=(p.codigo_barras||"").toLowerCase();
      return id.includes(t)||nom.includes(t)||bar.includes(t);
    });
  },[productos,buscar]);

  const subtotal = useMemo(()=>items.reduce((a,x)=>
    a + (+x.cantidad||0) * (+x.precioUnitario||0),0),[items]);
  const total = subtotal;

  const updateItem = (id, patch) => setItems(prev=>prev.map(x=>x.id===id?{...x,...patch}:x));
  const addItem = () => setItems(prev=>[...prev,{id:Date.now(),productoId:"",cantidad:1,precioUnitario:0}]);
  const removeItem = (id) => setItems(prev=>prev.filter(x=>x.id!==id));

  const openGramajeIfNeeded = (rowId, prod) => {
    const key = normalize(prod?.unidad_medida);
    if (prod && U_VAR.has(key)) {
      setModal({ show:true, rowId, prod, cant:1 });
      return true;
    }
    return false;
  };

  const handleChangeProducto = (rowId, productoId) => {
    const prod = productos.find(p=>String(p.id)===String(productoId));
    updateItem(rowId,{ productoId, precioUnitario: prod? +prod.precio_venta : 0 });
    openGramajeIfNeeded(rowId, prod);
  };

  const confirmarGramaje = () => {
    if (!modal.rowId || !modal.prod) { setModal(s=>({...s,show:false})); return; }
    const cant = +modal.cant || 0;
    updateItem(modal.rowId,{ cantidad: cant>0?cant:1 });
    setModal(s=>({...s,show:false}));
  };

  const handleScan = (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if(!code) return;
    const prod = productos.find(p => String(p.codigo_barras||"").trim()===code);
    if(!prod){ alert("Código no encontrado en catálogo."); return; }
    const rowId = Date.now();
    setItems(prev=>[...prev,{ id:rowId, productoId:prod.id, cantidad:1, precioUnitario:+prod.precio_venta||0 }]);
    setTimeout(()=>openGramajeIfNeeded(rowId, prod),0);
    setBarcode("");
  };

  const puedeGuardar = items.some(x=>x.productoId && +x.cantidad>0) && total>0;

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrGuardar("");
    if(!puedeGuardar){ setErrGuardar("Agrega al menos un producto válido para guardar la venta."); return; }
    setGuardando(true);
    try{
      const venta = {
        id_cliente: clienteId? +clienteId : null,
        fecha: nowDate(),
        hora: nowTime(),
        tipo_pago: tipoPago,
        total: +total,
        id_corte: corteCajaAbierto ? (typeof corteCajaAbierto==="object"?corteCajaAbierto.id:+corteCajaAbierto) : null,
      };
      const { data:ventaIns, error:errVenta } = await supabase.from("Ventas").insert([venta]).select("id").single();
      if(errVenta) throw errVenta;
      const ventaId = ventaIns?.id; if(!ventaId) throw new Error("No se obtuvo el ID de la venta.");

      const detalle = items.filter(x=>x.productoId && +x.cantidad>0).map(x=>({
        id_venta: ventaId,
        id_producto: +x.productoId,
        cantidad: +x.cantidad,
        precio_unitario: +x.precioUnitario,
        subtotal: (+x.cantidad)*(+x.precioUnitario||0),
      }));
      const { error:errDet } = await supabase.from("DetalleVenta").insert(detalle);
      if(errDet) throw errDet;

      if(tipoPago==="CREDITO" && clienteId){
        const saldo = { id_cliente:+clienteId, fecha:nowDate(), hora:nowTime(), monto_que_pagar:+total, id_corte: venta.id_corte??null };
        const { error:errSaldo } = await supabase.from("SaldoCliente").insert([saldo]);
        if(errSaldo) console.warn("SaldoCliente no registrado:", errSaldo);
      }

      let creada=null;
      try{ const r = onSubmit({ ...venta, id:ventaId, detalle }); creada = typeof r?.then==="function"? await r : r; }catch{}

      const destinoId = creada?.id ?? ventaId;

      // ⬇️ Cambio mínimo: navegar al detalle por QUERY STRING (sin tocar rutas)
      navigate(`/detalle-venta?id=${destinoId}`);
    }catch(err){
      console.error(err);
      setErrGuardar(err?.message || "Ocurrió un error al guardar la venta.");
    }finally{ setGuardando(false); }
  };

  return (
    <div className="container my-4">
      <form onSubmit={handleSubmit} className="card shadow p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-primary m-0">Venta Rápida</h3>
          <span className={`badge ${tipoPago==="EFECTIVO"?"bg-success":"bg-info"}`}>
            {tipoPago==="EFECTIVO"?"Efectivo":"Crédito"}
          </span>
        </div>

        {!corteCajaAbierto && (
          <div className="alert alert-warning">
            No hay <strong>Corte de Caja</strong> abierto. La venta quedará pendiente de asociación.
          </div>
        )}
        {errProd && <div className="alert alert-danger">{errProd}</div>}
        {errGuardar && <div className="alert alert-danger">{errGuardar}</div>}
        {errCli && <div className="alert alert-danger">{errCli}</div>}

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Cliente (opcional)</label>
            <select className="form-select" value={clienteId} onChange={(e)=>setClienteId(e.target.value)} disabled={guardando||cargandoCli}>
              <option value="">— Sin cliente —</option>
              {clientesOpciones.map(c=>(
                <option key={c.id} value={c.id}>{nombreCompleto(c)||c.nombre||c.id}</option>
              ))}
            </select>
            {cargandoCli && <div className="form-text">Cargando clientes…</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Tipo de pago</label>
            <div className="btn-group w-100">
              {["EFECTIVO","CREDITO"].map(tp=>(
                <button key={tp} type="button"
                  className={`btn ${tipoPago===tp ? (tp==="EFECTIVO"?"btn-success":"btn-info") : (tp==="EFECTIVO"?"btn-outline-success":"btn-outline-info")}`}
                  onClick={()=>setTipoPago(tp)} disabled={guardando}>
                  {tp==="EFECTIVO"?"Efectivo":"Crédito"}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-8">
            <label className="form-label">Buscar producto</label>
            <input type="text" className="form-control" placeholder="Escribe nombre, ID o código de barras…"
              value={buscar} onChange={(e)=>setBuscar(e.target.value)} disabled={cargandoProd}/>
            {cargandoProd && <div className="form-text">Cargando productos…</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Escanear código de barras</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Pasa/teclea el código y Enter"
                value={barcode} onChange={(e)=>setBarcode(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") handleScan(e); }}
                disabled={cargandoProd||guardando}/>
              <button className="btn btn-outline-secondary" type="button" onClick={handleScan}
                disabled={!barcode.trim()||cargandoProd||guardando}>Agregar</button>
            </div>
            <div className="form-text">
              Si el producto es a granel (KG/L), se abrirá una ventana para capturar el “{U_LABEL(modal.prod?.unidad_medida)||"gramaje"}”.
            </div>
          </div>
        </div>

        <div className="table-responsive mb-3">
          <table className="table table-dark table-hover align-middle">
            <thead>
              <tr>
                <th style={{minWidth:260}}>Producto</th>
                <th style={{width:140}}>Cantidad</th>
                <th style={{width:170}}>P. Unitario</th>
                <th>Subtotal</th>
                <th style={{width:80}}></th>
              </tr>
            </thead>
            <tbody>
              {items.length===0 && (
                <tr><td colSpan={5} className="text-center">No hay productos. Agrega uno o escanea un código.</td></tr>
              )}
              {items.map(row=>{
                const prod = productos.find(p=>String(p.id)===String(row.productoId));
                const precio = +row.precioUnitario||0, cant = +row.cantidad||0, sub=cant*precio, key=normalize(prod?.unidad_medida);
                return (
                  <tr key={row.id}>
                    <td>
                      <select className="form-select" value={row.productoId}
                        onChange={(e)=>handleChangeProducto(row.id, e.target.value)}
                        disabled={cargandoProd||guardando}>
                        <option value="">— Selecciona —</option>
                        {productosFiltrados.map(p=>(
                          <option key={p.id} value={p.id}>
                            {p.nombre}{p.codigo_barras?` • ${p.codigo_barras}`:""}{p.unidad_medida?` • ${p.unidad_medida}`:""}
                          </option>
                        ))}
                      </select>
                      {prod?.unidad_medida && <small className="text-muted">Unidad: {U_LABEL(prod.unidad_medida)}</small>}
                    </td>

                    <td>
                      <input type="number" className="form-control"
                        min={U_VAR.has(key)?0.001:1} step={U_VAR.has(key)?"0.001":"1"}
                        value={row.cantidad}
                        onChange={(e)=>updateItem(row.id,{cantidad:e.target.value})}
                        disabled={guardando}/>
                      {prod && U_VAR.has(key) && (
                        <button type="button" className="btn btn-outline-info btn-sm mt-1"
                          onClick={()=>setModal({show:true,rowId:row.id,prod,cant:+row.cantidad||1})}
                          disabled={guardando}>
                          Capturar {U_LABEL(prod.unidad_medida)}
                        </button>
                      )}
                    </td>

                    <td>
                      <input type="number" className="form-control" min={0} step="0.01"
                        value={row.precioUnitario}
                        onChange={(e)=>updateItem(row.id,{precioUnitario:e.target.value})}
                        disabled={guardando}/>
                      {prod && <small className="text-muted d-block">Lista: {mxn(prod.precio_venta)} / {U_LABEL(prod.unidad_medida)}</small>}
                    </td>

                    <td>{mxn(sub)}</td>
                    <td><button type="button" className="btn btn-danger btn-sm" onClick={()=>removeItem(row.id)} disabled={guardando}>Quitar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button type="button" className="btn btn-outline-primary mb-3"
          onClick={addItem} disabled={cargandoProd||guardando||productosFiltrados.length===0}>
          + Agregar producto
        </button>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">Subtotal: {mxn(subtotal)}</h5>
            <h4 className="mb-0">Total: {mxn(total)}</h4>
          </div>
          <button type="submit" className="btn btn-success btn-lg" disabled={!puedeGuardar||guardando}>
            {guardando?"Guardando...":"Guardar Venta"}
          </button>
        </div>
      </form>

      {/* Modal */}
      <div className={`modal fade ${modal.show?"show d-block":""}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header">
              <h5 className="modal-title">Capturar {U_LABEL(modal.prod?.unidad_medida)}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={()=>setModal(s=>({...s,show:false}))}></button>
            </div>
            <div className="modal-body">
              <p className="mb-2">Producto: <strong>{modal.prod?.nombre}</strong>{modal.prod?.codigo_barras?` • ${modal.prod.codigo_barras}`:""}</p>
              <label className="form-label">Cantidad en {U_LABEL(modal.prod?.unidad_medida)}:</label>
              <input type="number" className="form-control" min="0.001" step="0.001"
                value={modal.cant} onChange={(e)=>setModal(s=>({...s,cant:e.target.value}))}/>
              <small className="text-muted">Precio por {U_LABEL(modal.prod?.unidad_medida)}: {mxn(modal.prod?.precio_venta||0)}</small>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={()=>setModal(s=>({...s,show:false}))}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarGramaje}>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
      {modal.show && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
