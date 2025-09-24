//Aquí van los import que necesites incorporar elementos de la carpeta components
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

/* 
Formulario de apertura de corte
Fecha y hora inicio (auto)
Fondo inicial 
*/

const STORAGE_KEY = "sisInVe_caja_session";

function AperturaDeCaja() {
    const navigate = useNavigate();

  const [montoInicial, setMontoInicial] = useState("");
  const [yaAbierta, setYaAbierta] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) setYaAbierta(true);
  }, []);

  const abrirCaja = (e) => {
    e.preventDefault();
    const valor = parseFloat(montoInicial);
    if (isNaN(valor) || valor < 0) {
      setMensaje("Ingresa un monto válido (número positivo).");
      return;
    }
    const session = {
      montoInicial: valor,
      horaInicio: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setMensaje("✅ Caja abierta correctamente.");
    setYaAbierta(true);
  };

  const formStyles =
    "max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-6 shadow";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className={formStyles}>
        <h1 className="text-2xl font-semibold mb-4">Apertura de Caja</h1>

        {yaAbierta ? (
          <>
            <p className="mb-4">
              Ya existe una sesión de caja abierta. Puedes ir al módulo de{" "}
              <strong>Cierre de Caja</strong>.
            </p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
                  onClick={() => navigate("/cierre-caja")}

            >
              Ir a Cierre de Caja
            </button>
          </>
        ) : (
          <form onSubmit={abrirCaja} className="space-y-4">
            <div>
              <label className="block mb-1">Dinero en caja al inicio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="Ej. 500.00"
                className="w-full px-3 py-2 rounded border bg-white/90 text-black"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 rounded bg-green-600 text-white"
            >
              Abrir caja
            </button>

            {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default AperturaDeCaja;