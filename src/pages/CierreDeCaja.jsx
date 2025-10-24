import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import { Button } from "@mui/material";

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
    };

    fetchUltimoCorte();
  }, []);

  // Función para cerrar la caja
  const cerrarCaja = async () => {
    try {
      const { data, error } = await supabase
        .from("CorteCaja")
        .update({
          hora_fin: horaFinal,
          fondo_actual: dineroActualEnCaja,
          diferencia: diferencia
        })
        .eq("id", corte.id);

      if (error) throw error;

      console.log("Corte cerrado:", data);
      alert("Caja cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar caja:", error.message);
    }
  };

  // Función para imprimir ticket
  const imprimirTicket = () => {
    const ticketContent = `
      <div style="font-family: monospace; width: 280px; padding: 10px;">
        <div style="text-align:center;">
          <h3 style="margin:0;">Corte de Caja</h3>
          <p style="margin:0;">===========================</p>
        </div>

        <p>ID Corte: ${corte.id}</p>
        <p>Fecha: ${corte.fecha}</p>
        <p>Hora Inicio: ${corte.hora_inicio}</p>
        <p>Hora Fin: ${horaFinal}</p>
        <p>Fondo Inicial: $${corte.fondo_inicial}</p>

        <p>---------------------------</p>
        <p>Detalle de Movimientos:</p>
        <p>Ventas Totales    : $${corte.ventas_total || 0}</p>
        <p>Devoluciones      : $${corte.devoluciones_total || 0}</p>
        <p>Fiado             : $${corte.fiado_total || 0}</p>
        <p>Abonos            : $${corte.abonos_total || 0}</p>
        <p>Pagos Proveedores : $${corte.pagos_total || 0}</p>
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

      <div className="mb-3"><strong>Dinero Actual en Caja:</strong> {dineroActualEnCaja}</div>
      <div className="mb-3"><strong>Diferencia:</strong> {diferencia}</div>

      <div className="d-flex justify-content-center gap-2">
        <Button variant="contained" color="success" onClick={cerrarCaja}>
          Cerrar Caja
        </Button>
        <Button variant="outlined" color="primary" onClick={imprimirTicket}>
          Imprimir Ticket
        </Button>
      </div>
    </div>
  );
}

export default CierreDeCaja;
