import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import "./aperturaCaja.css"; // 👈 nuevo CSS con tema oscuro

function AperturaDeCaja() {
  const [fondoInicial, setFondoInicial] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const ahora = new Date();
    setFechaActual(ahora.toISOString().split("T")[0]);
    setHoraActual(ahora.toTimeString().split(" ")[0]);
  }, []);

  const abrirCaja = async () => {
    if (!fondoInicial || fondoInicial <= 0) {
      alert("Ingresa un fondo inicial válido");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("CorteCaja").insert({
        fecha: fechaActual,
        hora_inicio: horaActual,
        fondo_inicial: fondoInicial,
      });

      if (error) throw error;

      setFondoInicial("");
      alert("✅ Caja abierta correctamente");
    } catch (error) {
      console.error("Error al abrir caja:", error.message);
      alert("❌ Error al abrir la caja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="apertura-container d-flex justify-content-center align-items-center py-5">
    <div className="card apertura-card p-4">
      <h3 className="text-center mb-4 fw-bold apertura-title">💵 Apertura de Caja</h3>

      <form>
        <div className="mb-3">
          <label className="form-label apertura-label fw-semibold">Fecha</label>
          <input
            type="text"
            className="form-control apertura-input text-center"
            value={fechaActual}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label apertura-label fw-semibold">Hora</label>
          <input
            type="text"
            className="form-control apertura-input text-center"
            value={horaActual}
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="form-label apertura-label fw-semibold">Fondo Inicial</label>
          <input
            type="number"
            className="form-control apertura-input text-center"
            value={fondoInicial}
            onChange={(e) => setFondoInicial(e.target.value)}
            placeholder="Ingresa el monto inicial"
            min="0"
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            className=" apertura-btn px-4"
            onClick={abrirCaja}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Abrir Caja"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}

export default AperturaDeCaja;
