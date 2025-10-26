import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '../services/client';
import { Link } from 'react-router-dom';
import './consultas.css'; // 👈 CSS personalizado

function Consultas() {
  const [resultados, setResultados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [error, setError] = useState(null);

  // 🔍 Consultas
  const getProductosConStock = async () => {
    setTitulo('Productos con Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('codigo_barras,nombre,costo,precio_venta,stock_actual')
      .gt('stock_actual', 0);
    error ? setError('Error: ' + error.message) : setResultados(data);
  };

  const getProductosSinStock = async () => {
    setTitulo('Productos sin Existencias');
    const { data, error } = await supabase
      .from('Productos')
      .select('codigo_barras,nombre,costo,precio_venta')
      .or('stock_actual.eq.0,stock_actual.is.null');
    error ? setError('Error: ' + error.message) : setResultados(data);
  };

  const getVentasPorFechaCredito = async () => {
    if (!fechaInicio || !fechaFin) return setError('Selecciona ambas fechas.');
    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];
    setTitulo(`Ventas a Crédito (${inicio} - ${fin})`);

    const { data, error } = await supabase
      .from('Ventas')
      .select('id,id_cliente,fecha,hora,total')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .eq('tipo_pago', 'Crédito');

    error ? setError('Error: ' + error.message) : setResultados(data);
  };

  const getVentasPorFechaContado = async () => {
    if (!fechaInicio || !fechaFin) return setError('Selecciona ambas fechas.');
    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];
    setTitulo(`Ventas de Contado (${inicio} - ${fin})`);

    const { data, error } = await supabase
      .from('Ventas')
      .select('id,fecha,hora,total')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .eq('tipo_pago', 'Contado');

    error ? setError('Error: ' + error.message) : setResultados(data);
  };

  const getDevolucionesPorFecha = async () => {
    if (!fechaInicio || !fechaFin) return setError('Selecciona ambas fechas.');
    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];
    setTitulo(`Devoluciones (${inicio} - ${fin})`);

    const { data, error } = await supabase
      .from('Devolucion')
      .select('*')
      .gte('fecha', inicio)
      .lte('fecha', fin);

    error ? setError('Error: ' + error.message) : setResultados(data);
  };

  return (
  <div className="consultas-container container my-5">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h1 className="consultas-title text-center flex-grow-1">Panel de Consultas</h1>
    </div>

    {/* 🔹 Sección de Productos */}
    <div className="consultas-card consultas-card-productos mb-4 p-3 border rounded shadow-sm bg-light">
      <h4 className="mb-3">Productos</h4>
      <div className="d-flex gap-2 flex-wrap">
        <button className="consultas-btn consultas-btn-primary" onClick={getProductosConStock}>Con Existencias</button>
        <button className="consultas-btn consultas-btn-danger-outline" onClick={getProductosSinStock}>Sin Existencias</button>
      </div>
    </div>

    {/* 🔹 Consultas por Fecha */}
    <div className="consultas-card consultas-card-fechas mb-4 p-3 border rounded shadow-sm bg-light">
      <h4 className="mb-3">Consultas por Fecha</h4>
      <div className="row mb-3 g-3">
        <div className="col-md-6">
          <label className="form-label">Desde:</label>
          <DatePicker
            className="form-control consultas-datepicker"
            selected={fechaInicio}
            onChange={setFechaInicio}
            dateFormat="yyyy-MM-dd"
            placeholderText="Selecciona fecha inicio"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Hasta:</label>
          <DatePicker
            className="form-control consultas-datepicker"
            selected={fechaFin}
            onChange={setFechaFin}
            dateFormat="yyyy-MM-dd"
            placeholderText="Selecciona fecha fin"
          />
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button className="consultas-btn consultas-btn-success" onClick={getVentasPorFechaCredito}>Ventas (Crédito)</button>
        <button className="consultas-btn consultas-btn-warning" onClick={getVentasPorFechaContado}>Ventas (Contado)</button>
        <button className="consultas-btn consultas-btn-info" onClick={getDevolucionesPorFecha}>Devoluciones</button>
      </div>
    </div>

    {/* 🔹 Mensaje de error */}
    {error && <div className="alert-danger mt-2 consultas-alert">{error}</div>}

    {/* 🔹 Tabla de resultados */}
    <div className="consultas-resultados table-responsive mt-4">
      {resultados.length > 0 ? (
        <>
          <h4 className="consultas-resultados-title mt-4">{titulo}</h4>
          <table className="table table-striped table-hover consultas-table mt-2">
            <thead className="consultas-thead">
              <tr>
                {Object.keys(resultados[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultados.map((row, index) => (
                <tr key={index} className="consultas-row">
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-center mt-3 text-muted consultas-no-results">No hay resultados aún.</p>
      )}
    </div>
  </div>
);

}

export default Consultas;
