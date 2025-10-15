import { useState, useEffect } from "react";
import { supabase } from "../services/client";

function CierreDeCaja() {
  const [corte, setCorte] = useState(null);
  const [horaFinal, setHoraFinal] = useState('');
  const [dineroActualEnCaja, setDineroActualEnCaja] = useState(0);
  const [diferencia, setDiferencia] = useState(0);

  // Traer el último corte abierto
  useEffect(() => {
    const fetchUltimoCorte = async () => {
      const { data, error } = await supabase
        .from("CorteCaja")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error al cargar el corte:", error);
      } else if (data.length > 0) {
        const ultimoCorte = data[0];
        setCorte(ultimoCorte);
        setHoraFinal(new Date().toTimeString().split(" ")[0]);

        // Calcular dinero actual en caja según movimientos
        const total = 
          Number(ultimoCorte.fondo_inicial || 0) +
          Number(ultimoCorte.ventas_total || 0) + // Solo ventas contado
          Number(ultimoCorte.abonos_total || 0) +
          Number(ultimoCorte.depositos_total || 0) -
          Number(ultimoCorte.devoluciones_total || 0) -
          Number(ultimoCorte.pagos_total || 0) -
          Number(ultimoCorte.retiros_total || 0);

        setDineroActualEnCaja(total);

        // Calcular diferencia entre fondo inicial y dinero actual en caja
        setDiferencia(total - Number(ultimoCorte.fondo_inicial || 0));
      }
    };

    fetchUltimoCorte();
  }, []);

  const cerrarCaja = async () => {
    try {
      const { data, error } = await supabase
        .from("CorteCaja")
        .update({
          hora_fin: horaFinal,
          fondo_actual: dineroActualEnCaja,
          diferencia: diferencia // Se guarda la diferencia calculada
        })
        .eq("id", corte.id);

      if (error) throw error;

      console.log("Corte cerrado:", data);
      alert("Caja cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar caja:", error.message);
    }
  };

  if (!corte) return <div>Cargando corte...</div>;

  return (
    <div className="container w-50 mt-4">
      <h3 className="text-center mb-4">Cierre de Caja</h3>

      <div className="mb-2"><strong>ID Corte:</strong> {corte.id}</div>
      <div className="mb-2"><strong>Fecha:</strong> {corte.fecha}</div>
      <div className="mb-2"><strong>Hora Inicio:</strong> {corte.hora_inicio}</div>
      <div className="mb-2"><strong>Hora Fin:</strong> {horaFinal}</div>
      <div className="mb-2"><strong>Fondo Inicial:</strong> {corte.fondo_inicial}</div>

      <hr />

      <div className="mb-2"><strong>Ventas Totales:</strong> {corte.ventas_total || 0}</div>
      <div className="mb-2"><strong>Devoluciones:</strong> {corte.devoluciones_total || 0}</div>
      <div className="mb-2"><strong>Fiado:</strong> {corte.fiado_total || 0}</div>
      <div className="mb-2"><strong>Abonos:</strong> {corte.abonos_total || 0}</div>
      <div className="mb-2"><strong>Pagos a Proveedores:</strong> {corte.pagos_total || 0}</div>
      <div className="mb-2"><strong>Retiros:</strong> {corte.retiros_total || 0}</div>
      <div className="mb-2"><strong>Depósitos:</strong> {corte.depositos_total || 0}</div>

      <hr />

      <div className="mb-3">
        <strong>Dinero Actual en Caja:</strong> {dineroActualEnCaja}
      </div>
      <div className="mb-3">
        <strong>Diferencia:</strong> {diferencia}
      </div>

      <div className="d-flex justify-content-center">
        <button className="btn btn-success" onClick={cerrarCaja}>
          Cerrar Caja
        </button>
      </div>
    </div>
  );
}

export default CierreDeCaja;
