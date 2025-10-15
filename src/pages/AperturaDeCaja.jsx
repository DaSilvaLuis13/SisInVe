import { useState, useEffect } from "react";
import { supabase } from "../services/client";

function AperturaDeCaja() {
  const [fondoInicial, setFondoInicial] = useState('');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  // Actualizar fecha y hora al cargar el componente
  useEffect(() => {
    const ahora = new Date();
    setFechaActual(ahora.toISOString().split("T")[0]);
    setHoraActual(ahora.toTimeString().split(" ")[0]);
  }, []);

  const abrirCaja = async () => {
    if (!fondoInicial) {
      alert("Ingresa un fondo inicial válido");
      return;
    }

    try {
      const { data, error } = await supabase.from("CorteCaja").insert({
        fecha: fechaActual,
        hora_inicio: horaActual,
        fondo_inicial: fondoInicial,
      });

      if (error) throw error;

      // Reiniciar fondo inicial
      setFondoInicial('');
      console.log("Caja abierta:", data);

    } catch (error) {
      console.error("Error al abrir caja:", error.message);
    }
  }

  return (
    <div className="container w-50 mt-4">
      <h3 className="text-center mb-4">Apertura de Caja</h3>
      
      <form>
        <div className="mb-3">
          <label className="form-label">Fecha:</label>
          <input 
            type="text"
            className="form-control text-center"
            value={fechaActual}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Hora:</label>
          <input 
            type="text"
            className="form-control text-center"
            value={horaActual}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Fondo Inicial:</label>
          <input 
            type="number"
            className="form-control text-center"
            value={fondoInicial}
            onChange={(e) => setFondoInicial(e.target.value)}
            placeholder="Ingresa el monto inicial"
          />
        </div>

        <div className="d-flex justify-content-center">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={abrirCaja}
          >
            Abrir Caja
          </button>
        </div>
      </form>
    </div>
  )
}

export default AperturaDeCaja;
