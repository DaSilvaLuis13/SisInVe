import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import { useCaja } from "../context/CajaContext"; // nuestro contexto
import "./cierreCaja.css";

function CierreDeCaja() {
  const [corte, setCorte] = useState(null);
  const [horaFinal, setHoraFinal] = useState("");
  const [dineroActualEnCaja, setDineroActualEnCaja] = useState(0);
  const [diferencia, setDiferencia] = useState(0);
  const [loading, setLoading] = useState(true);

  const { setCajaAbierta } = useCaja();

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

        const hora = new Date().toTimeString().split(" ")[0];
        setHoraFinal(hora);

        const total =
          Number(ultimoCorte.fondo_inicial || 0) +
          Number(ultimoCorte.ventas_total || 0) +
          Number(ultimoCorte.abonos_total || 0) +
          Number(ultimoCorte.depositos_total || 0) -
          Number(ultimoCorte.devoluciones_total || 0) -
          Number(ultimoCorte.pagos_total || 0) -
          Number(ultimoCorte.retiros_total || 0);

        setDineroActualEnCaja(total);
        setDiferencia(total - Number(ultimoCorte.fondo_inicial || 0));
      }
      setLoading(false);
    };

    fetchUltimoCorte();
  }, []);

  const cerrarCaja = async () => {
    try {
      const { error } = await supabase
        .from("CorteCaja")
        .update({
          hora_fin: horaFinal,
          fondo_actual: dineroActualEnCaja,
          diferencia,
          estado: "cerrada",
        })
        .eq("id", corte.id);

      if (error) throw error;

      // Bloquea todo el sistema
      setCajaAbierta(false);

      alert("✅ Caja cerrada correctamente");

      // Redirige automáticamente a apertura de caja
      window.location.href = "/apertura-caja";
    } catch (error) {
      console.error("Error al cerrar caja:", error.message);
      alert("❌ Error al cerrar caja");
    }
  };

  const imprimirTicket = () => {
    if (!corte) return;
    const ticketContent = `
      <div style="font-family: monospace; width: 280px; padding: 10px;">
        <div style="text-align:center;">
          <h3 style="margin:0;">Corte de Caja</h3>
          <p>===========================</p>
        </div>
        <p>ID Corte: ${corte.id}</p>
        <p>Fecha: ${corte.fecha}</p>
        <p>Hora Inicio: ${corte.hora_inicio}</p>
        <p>Hora Fin: ${horaFinal}</p>
        <p>Fondo Inicial: $${corte.fondo_inicial}</p>
        <p>---------------------------</p>
        <p>Ventas Totales    : $${corte.ventas_total || 0}</p>
        <p>Devoluciones      : $${corte.devoluciones_total || 0}</p>
        <p>Fiado             : $${corte.fiado_total || 0}</p>
        <p>Abonos            : $${corte.abonos_total || 0}</p>
        <p>Pagos             : $${corte.pagos_total || 0}</p>
        <p>Retiros           : $${corte.retiros_total || 0}</p>
        <p>Depósitos         : $${corte.depositos_total || 0}</p>
        <p>---------------------------</p>
        <p>Dinero Actual     : $${dineroActualEnCaja}</p>
        <p>Diferencia        : $${diferencia}</p>
        <p style="text-align:center;">===========================</p>
        <p style="text-align:center;">¡Gracias por su preferencia!</p>
      </div>
    `;
    const printWindow = window.open("", "_blank", "width=300,height=600");
    printWindow.document.write(ticketContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) return <div className="text-center mt-5">Cargando corte...</div>;

  return (
    <div className="cierre-container d-flex justify-content-center align-items-center py-5">
      <div className="card cierre-card p-4">
        <h3 className="text-center mb-4 fw-bold cierre-title">🧾 Cierre de Caja</h3>

        <div className="info-grid cierre-info-grid mb-4">
          <div className="cierre-label"><strong>ID Corte:</strong> {corte.id}</div>
          <div className="cierre-label"><strong>Fecha:</strong> {corte.fecha}</div>
          <div className="cierre-label"><strong>Hora Inicio:</strong> {corte.hora_inicio}</div>
          <div className="cierre-label"><strong>Hora Fin:</strong> {horaFinal}</div>
          <div className="cierre-label"><strong>Fondo Inicial:</strong> ${corte.fondo_inicial}</div>
        </div>

        <hr className="text-secondary" />

        <div className="info-grid cierre-info-grid">
          <div className="cierre-label"><strong>Ventas Totales:</strong> ${corte.ventas_total || 0}</div>
          <div className="cierre-label"><strong>Devoluciones:</strong> ${corte.devoluciones_total || 0}</div>
          <div className="cierre-label"><strong>Fiado:</strong> ${corte.fiado_total || 0}</div>
          <div className="cierre-label"><strong>Abonos:</strong> ${corte.abonos_total || 0}</div>
          <div className="cierre-label"><strong>Pagos:</strong> ${corte.pagos_total || 0}</div>
          <div className="cierre-label"><strong>Retiros:</strong> ${corte.retiros_total || 0}</div>
          <div className="cierre-label"><strong>Depósitos:</strong> ${corte.depositos_total || 0}</div>
        </div>

        <hr className="text-secondary" />

        <div className="totales cierre-totales text-center mb-3">
          <div className="cierre-label"><strong>Dinero Actual:</strong> ${dineroActualEnCaja}</div>
          <div className="cierre-label"><strong>Diferencia:</strong> ${diferencia}</div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="cierre-btn cierre-btn-cerrar" onClick={cerrarCaja}>
            Cerrar Caja
          </button>
          <button className="cierre-btn cierre-btn-imprimir" onClick={imprimirTicket}>
            Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default CierreDeCaja;
