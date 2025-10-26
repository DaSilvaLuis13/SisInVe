import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import "./movimientoCaja.css"; // 👈 nuevo archivo CSS

function MovimientoCaja() {
  const [tipo, setTipo] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState(null);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idCorte, setIdCorte] = useState(null);
  const [corteActual, setCorteActual] = useState(null);

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
      } else {
        console.error("Error obteniendo el último corte:", error);
      }
    };
    fetchUltimoCorte();
  }, []);

  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase.from("Proveedores").select("*");
      if (!error) setProveedores(data);
      else console.error("Error obteniendo proveedores:", error);
    };
    fetchProveedores();
  }, []);

  const registrarMovimiento = async () => {
    if (!tipo || !monto || !idCorte) {
      alert("Completa todos los campos necesarios.");
      return;
    }

    const fecha = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("es-ES", { hour12: false });

    const { error } = await supabase.from("MovimientosCaja").insert([
      {
        id_proveedor: tipo === "Pago" ? idProveedor : null,
        fecha,
        hora,
        tipo,
        monto: parseFloat(monto),
        descripcion,
        id_corte: idCorte,
      },
    ]);

    if (error) {
      console.error("Error al registrar movimiento:", error);
      alert("Error al registrar el movimiento.");
      return;
    }

    let nuevosTotales = { ...corteActual };
    const montoFloat = parseFloat(monto);
    nuevosTotales.pagos_total ??= 0;
    nuevosTotales.retiros_total ??= 0;
    nuevosTotales.depositos_total ??= 0;
    nuevosTotales.fondo_actual ??= 0;

    if (tipo === "Pago") {
      nuevosTotales.pagos_total += montoFloat;
      nuevosTotales.fondo_actual -= montoFloat;
    } else if (tipo === "Retiro") {
      nuevosTotales.retiros_total += montoFloat;
      nuevosTotales.fondo_actual -= montoFloat;
    } else if (tipo === "Deposito") {
      nuevosTotales.depositos_total += montoFloat;
      nuevosTotales.fondo_actual += montoFloat;
    }

    const { error: updateError } = await supabase
      .from("CorteCaja")
      .update({
        pagos_total: nuevosTotales.pagos_total,
        retiros_total: nuevosTotales.retiros_total,
        depositos_total: nuevosTotales.depositos_total,
        fondo_actual: nuevosTotales.fondo_actual,
      })
      .eq("id", idCorte);

    if (updateError) {
      console.error("Error al actualizar corte:", updateError);
      alert("Error al actualizar el corte.");
      return;
    }

    setCorteActual(nuevosTotales);
    alert("✅ Movimiento registrado correctamente.");

    setTipo("");
    setIdProveedor(null);
    setMonto("");
    setDescripcion("");
  };

  return (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className=" movimiento-card p-4">

      <h3 className="text-center mb-4 fw-bold">
        💰 Movimiento de Caja
      </h3>

      <div className="mb-3">
        <label className="form-label">Tipo de Movimiento</label>
        <select
          className="movimiento-input"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">Selecciona...</option>
          <option value="Deposito">Depósito</option>
          <option value="Retiro">Retiro</option>
          <option value="Pago">Pago a Proveedor</option>
        </select>
      </div>

      {tipo === "Pago" && (
        <div className="mb-3">
          <label className="form-label">Proveedor</label>
          <select
            className="movimiento-input"
            value={idProveedor || ""}
            onChange={(e) => setIdProveedor(parseInt(e.target.value))}
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.length > 0 ? (
              proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.empresa}
                </option>
              ))
            ) : (
              <option disabled>No hay proveedores</option>
            )}
          </select>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Monto</label>
        <input
          type="number"
          className="movimiento-input"
          value={monto}
          min={0}
          onChange={(e) => setMonto(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <textarea
          className="movimiento-input"
          rows="2"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="text-center">
        <button
          onClick={registrarMovimiento}
          className="movimiento-btn px-4"
        >
          Registrar
        </button>
      </div>

    </div>
  </div>
);

}

export default MovimientoCaja;
