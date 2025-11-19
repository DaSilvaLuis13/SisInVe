// src/pages/AperturaDeCaja.jsx
import { useState, useEffect } from "react";
import { supabase } from "../services/client";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";
import "./aperturaCaja.css";
import {
  alertaExito,
  alertaError,
  alertaInfo,
} from "../utils/alerts";

function AperturaDeCaja() {
  const [fondoInicial, setFondoInicial] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setCajaAbierta } = useCaja();
  const navigate = useNavigate();

  useEffect(() => {
    const ahora = new Date();
    setFechaActual(ahora.toLocaleDateString("en-CA"));
    setHoraActual(ahora.toLocaleTimeString("en-GB"));
  }, []);

  const abrirCaja = async () => {
    try {
      const hoy = new Date().toLocaleDateString("en-CA");

      // Verificar si ya hay caja abierta
      const { data: cajaHoy, error: errorCheck } = await supabase
        .from("CorteCaja")
        .select("*")
        .eq("fecha", hoy)
        .eq("estado", "abierta");

      if (errorCheck) throw errorCheck;
      if (cajaHoy?.length > 0) {
        alertaInfo("Ya hay una caja abierta para hoy.");
        return;
      }

      if (!fondoInicial || fondoInicial <= 0) {
        alertaError("Ingresa un fondo inicial válido.");
        return;
      }

      setIsSubmitting(true);

      const { error } = await supabase.from("CorteCaja").insert({
        fecha: hoy,
        hora_inicio: new Date().toLocaleTimeString("en-GB"),
        fondo_inicial: fondoInicial,
        estado: "abierta",
      });

      if (error) throw error;

      await alertaExito("Caja abierta correctamente.");
      setCajaAbierta(true); // 🔹 Actualiza el contexto global
      navigate("/", { replace: true }); // Redirige al home
    } catch (error) {
      console.error("Error al abrir caja:", error.message);
      alertaError("Error al abrir la caja.");
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
            <input type="text" className="form-control text-center" value={fechaActual} disabled />
          </div>

          <div className="mb-3">
            <label className="form-label apertura-label fw-semibold">Hora</label>
            <input type="text" className="form-control text-center" value={horaActual} disabled />
          </div>

          <div className="mb-4">
            <label className="form-label apertura-label fw-semibold">Fondo Inicial</label>
            <input
              type="number"
              className="form-control text-center"
              value={fondoInicial}
              onChange={(e) => setFondoInicial(e.target.value)}
              placeholder="Ingresa el monto inicial"
              min="0"
            />
          </div>

          <div className="text-center">
            <button
              type="button"
              className="apertura-btn px-4"
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
