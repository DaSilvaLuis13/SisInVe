//Aquí van los import que necesites incorporar elementos de la carpeta components
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* 
Formulario de cierre de corte
Hora fin (auto)
Dinero real contado
Mostrar ventas totales, devoluciones y movimientos de caja
Calcular diferencia automáticamente
*/

const STORAGE_KEY = "sisInVe_caja_session";

function fmtMoney(n) {
  if (Number.isNaN(n)) return "$0.00";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
function toNumber(v) {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}
function isoToLocal(dtIso) {
  try {
    const d = new Date(dtIso);
    return d.toLocaleString();
  } catch {
    return "-";
  }
}

function CierreDeCaja() {
  const [session, setSession] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  });

  const navigate = useNavigate();


  const [ventas,setVentas] = useState("");
  const [devoluciones, setDevoluciones] = useState("");
  const [movCaja, setMovCaja] = useState("");
  const [realContado, setRealContado] = useState("");
  const [horaFin, setHoraFin] = useState(() => new Date().toISOString());



  useEffect(() => {
    // (solo por si cambió en otra pestaña)
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) setSession(JSON.parse(s));
    setHoraFin(new Date().toISOString());
  }, []);

  const esperado = useMemo(() => {
    const inicial = session?.montoInicial ?? 0;
    return (
      parseFloat(inicial) +
      parseFloat(ventas || 0) -
      parseFloat(devoluciones || 0) +
      parseFloat(movCaja || 0)
    );
  }, [session, ventas, devoluciones, movCaja]);

  const diferencia = useMemo(() => {
    return parseFloat(realContado || 0) - esperado;
  }, [realContado, esperado]);


  const limpiarSesion = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const guardarCorte = (e) => {
    e.preventDefault();
    // Aquí podrías llamar a tu API/DB para registrar el corte
    alert(
      [
        "Corte guardado:",
        `Inicio: ${isoToLocal(session?.horaInicio)}`,
        `Fin: ${isoToLocal(horaFin)}`,
        `Inicial: ${fmtMoney(session?.montoInicial ?? 0)}`,
        `Ventas: ${fmtMoney(toNumber(ventas))}`,
        `Devoluciones: ${fmtMoney(toNumber(devoluciones))}`,
        `Mov. Caja: ${fmtMoney(toNumber(movCaja))}`,
        `Esperado: ${fmtMoney(esperado)}`,
        `Real contado: ${fmtMoney(toNumber(realContado))}`,
        `Diferencia: ${fmtMoney(diferencia)} (${diferencia === 0 ? "Cuadre" : diferencia > 0 ? "Sobrante" : "Faltante"})`,
      ].join("\n")
    );
    // Al finalizar el cierre, opcionalmente cerramos la sesión de caja:
    limpiarSesion();
  };

  const formStyles =
    "max-w-2xl w-full bg-white/5 border border-white/10 rounded-xl p-6 shadow";

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className={formStyles}>
          <h1 className="text-2xl font-semibold mb-4">Cierre de Caja</h1>
          <p className="mb-4">
            No hay una <strong>apertura de caja</strong> activa.
          </p>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
                    onClick={() => navigate("/apertura-caja")}

          >
            Ir a Apertura de Caja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className={formStyles}>
        <h1 className="text-2xl font-semibold mb-2">Cierre de Caja</h1>

        {/* Resumen apertura */}
        <div className="text-sm mb-4 space-y-1">
          <div><strong>Hora inicio:</strong> {isoToLocal(session.horaInicio)}</div>
          <div><strong>Monto inicial:</strong> {fmtMoney(session.montoInicial)}</div>
        </div>

        <form onSubmit={guardarCorte} className="grid md:grid-cols-2 gap-4">
          {/* Hora fin (auto) */}
          <div className="md:col-span-2">
            <label className="block mb-1">Hora fin (automática)</label>
            <input
              type="text"
              value={isoToLocal(horaFin)}
              readOnly
              className="w-full px-3 py-2 rounded border bg-gray-100 text-black"
            />
          </div>

          {/* Ventas / devoluciones / movimientos */}
          <div>
            <label className="block mb-1">Ventas totales</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={ventas}
              onChange={(e) => setVentas(e.target.value)}
              placeholder="Ej. 3250.00"
              className="w-full px-3 py-2 rounded border bg-white/90 text-black"
            />
          </div>

          <div>
            <label className="block mb-1">Devoluciones</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={devoluciones}
              onChange={(e) => setDevoluciones(e.target.value)}
              placeholder="Ej. 150.00"
              className="w-full px-3 py-2 rounded border bg-white/90 text-black"
            />
          </div>

          <div>
            <label className="block mb-1">Movimientos de caja (+/-)</label>
            <input
              type="number"
              step="0.01"
              value={movCaja}
              onChange={(e) => setMovCaja(e.target.value)}
              placeholder="Ej. -200.00 (retiro) / 500.00 (depósito)"
              className="w-full px-3 py-2 rounded border bg-white/90 text-black"
            />
          </div>

          <div>
            <label className="block mb-1">Dinero real contado</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={realContado}
              onChange={(e) => setRealContado(e.target.value)}
              placeholder="Ej. 3400.00"
              className="w-full px-3 py-2 rounded border bg-white/90 text-black"
            />
          </div>

          {/* Totales calculados */}
          <div className="md:col-span-2 grid md:grid-cols-3 gap-4 mt-2">
            <div className="p-3 rounded border">
              <div className="text-xs opacity-80">Esperado en caja</div>
              <div className="text-lg font-semibold">{fmtMoney(esperado)}</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-xs opacity-80">Real contado</div>
              <div className="text-lg font-semibold">
                {fmtMoney(toNumber(realContado))}
              </div>
            </div>
            <div
              className={`p-3 rounded border ${
                diferencia === 0
                  ? "border-green-500"
                  : diferencia > 0
                  ? "border-blue-500"
                  : "border-red-500"
              }`}
            >
              <div className="text-xs opacity-80">Diferencia</div>
              <div className="text-lg font-semibold">
                {fmtMoney(diferencia)}{" "}
                <span className="text-sm opacity-80">
                  {diferencia === 0
                    ? "(Cuadre)"
                    : diferencia > 0
                    ? "(Sobrante)"
                    : "(Faltante)"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Guardar corte
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-600 text-white"
              onClick={limpiarSesion}
              title="Borrar sesión local de apertura"
            >
              Limpiar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CierreDeCaja;
