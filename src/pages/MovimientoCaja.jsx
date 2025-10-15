import { useState, useEffect } from "react";
import { supabase } from "../services/client";

function MovimientoCaja() {
  const [tipo, setTipo] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [idProveedor, setIdProveedor] = useState(null);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idCorte, setIdCorte] = useState(null);
  const [corteActual, setCorteActual] = useState(null);

  // Obtener el último corte de caja creado
  useEffect(() => {
    const fetchUltimoCorte = async () => {
      const { data, error } = await supabase
        .from("CorteCaja")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error obteniendo el último corte:", error);
      } else if (data) {
        setIdCorte(data.id);
        setCorteActual(data);
      }
    };

    fetchUltimoCorte();
  }, []);

  // Cargar proveedores al inicio
  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase.from("Proveedores").select("*");
      if (error) console.error("Error obteniendo proveedores:", error);
      else setProveedores(data);
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

  // 🧮 Actualizar totales del corte
  let nuevosTotales = { ...corteActual };
  const montoFloat = parseFloat(monto);

  // Inicializar si vienen null
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

  // 🔄 Actualizar estado local para mantener sincronizado
  setCorteActual(nuevosTotales);

  alert("Movimiento registrado correctamente.");
  setTipo("");
  setIdProveedor(null);
  setMonto("");
  setDescripcion("");
};


  return (
    <div className="p-4 bg-white rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar Movimiento de Caja</h2>

      <label className="block mb-2">Tipo de Movimiento:</label>
      <select
        className="border p-2 rounded w-full mb-4"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="">Selecciona...</option>
        <option value="Deposito">Depósito</option>
        <option value="Retiro">Retiro</option>
        <option value="Pago">Pago a Proveedor</option>
      </select>

      {tipo === "Pago" && (
        <>
          <label className="block mb-2">Proveedor:</label>
          <select
            className="border p-2 rounded w-full mb-4"
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
              <option disabled>No hay proveedores registrados</option>
            )}
          </select>
        </>
      )}

      <label className="block mb-2">Monto:</label>
      <input
        type="number"
        className="border p-2 rounded w-full mb-4"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <label className="block mb-2">Descripción:</label>
      <textarea
        className="border p-2 rounded w-full mb-4"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <button
        onClick={registrarMovimiento}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
      >
        Registrar
      </button>
    </div>
  );
}

export default MovimientoCaja;
