import { useState } from 'react';
import { supabase } from '../services/client'
import './Consultas.css';

function Consultas() {
  // Estados para guardar los datos de las consultas
  const [resultados, setResultados] = useState([]);
  const [titulo, setTitulo] = useState('');

  // Estados para el rango de fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState(null);

  // --- FUNCIONES DE CONSULTA ---

  // 1. Productos con existencias (cantidad > 0)
  const getProductosConStock = async () => {
    setTitulo('Productos con Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('id,codigo_barras,nombre,costo,ganancia,stock_actual')
      .gt('stock_actual', 0); // 'gt' significa "greater than" (mayor que)

    if (error) {
      setError('Error al consultar productos con stock: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  // 2. Productos sin existencias (cantidad = 0)
  const getProductosSinStock = async () => {
    setTitulo('Productos sin Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('id,codigo_barras,nombre,costo,ganancia,stock_actual')
      .or('stock_actual.eq.0,stock_actual.is.null');

    if (error) {
      setError('Error al consultar productos sin stock: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  // 3. Ventas por rango de fechas (Crédito)
  const getVentasPorFechaCredito = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }
    // AQUÍ ESTÁ EL CAMBIO
    setTitulo(`Ventas a Crédito desde ${fechaInicio} hasta ${fechaFin}`);
    const { data, error } = await supabase
      .from('Ventas')
      .select('id,id_cliente,fecha,hora,tipo_pago,total')
      .gte('fecha', fechaInicio) // 'gte' es "greater than or equal" (mayor o igual que)
      .lte('fecha', fechaFin)   // 'lte' es "less than or equal" (menor o igual que)
      .eq('tipo_pago', 'Crédito');

    if (error) {
      setError('Error al consultar las ventas: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };
  
  // 4. Ventas por rango de fechas (Contado)
  const getVentasPorFechaContado = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }
    // Y AQUÍ ESTÁ EL OTRO CAMBIO
    setTitulo(`Ventas de Contado desde ${fechaInicio} hasta ${fechaFin}`);
    const { data, error } = await supabase
      .from('Ventas')
      .select('id,fecha,hora,total')
      .gte('fecha', fechaInicio) // 'gte' es "greater than or equal" (mayor o igual que)
      .lte('fecha', fechaFin)   // 'lte' es "less than or equal" (menor o igual que)
      .eq('tipo_pago', 'Contado');
    if (error) {
      setError('Error al consultar las ventas: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  // 5. Devoluciones por rango de fechas
  const getDevolucionesPorFecha = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }
    setTitulo(`Devoluciones desde ${fechaInicio} hasta ${fechaFin}`);
    const { data, error } = await supabase
      .from('Devolucion')
      .select('*')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    if (error) {
      setError('Error al consultar las devoluciones: ' + error.message);
      setResultados([]);
    } else {
      setResultados(data);
      setError(null);
    }
  };

  return (
    <div className="consultas-container">
      <h1>Panel de Consultas</h1>

      {/* Sección de Productos */}
      <div className="seccion">
        <h2>Productos</h2>
        <button onClick={getProductosConStock}>Mostrar con Existencias</button>
        <button onClick={getProductosSinStock}>Mostrar sin Existencias</button>
      </div>

      {/* Sección de Consultas por Fecha */}
      <div className="seccion">
        <h2>Consultas por Rango de Fecha</h2>
        <div className="date-picker">
          <label>
            Desde:
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </label>
          <label>
            Hasta:
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </label>
        </div>
        <button onClick={getVentasPorFechaCredito}>Buscar Ventas (Credito)</button>
        <button onClick={getVentasPorFechaContado}>Buscar Ventas (Contado)</button>
        <button onClick={getDevolucionesPorFecha}>Buscar Devoluciones</button>
      </div>
      
      {/* Mensaje de error */}
      {error && <p className="error-message">{error}</p>}

      {/* Tabla de Resultados */}
      <div className="table-container">
        {resultados.length > 0 ? (
          <div>
            <h2>{titulo}</h2>
            <table>
              <thead>
                <tr>
                  {Object.keys(resultados[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultados.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay resultados para mostrar. Realiza una consulta.</p>
        )}
      </div>
    </div>
  );
}

export default Consultas;